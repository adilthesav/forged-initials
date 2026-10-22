#!/usr/bin/env node
// Generates FedEx sample labels in the FedEx TEST (sandbox) environment for
// Shipping Label Validation. The request matches what the live server sends in
// supabase/functions/server/shipping.ts (Ground Home Delivery, letter-size PDF,
// label on the top half), so FedEx evaluates the same label customers get.
//
// Usage:  node scripts/fedex-sample-labels.mjs
// It asks for the project's TEST API key, TEST secret key and TEST account
// number (FedEx Developer Portal → forgedinitials-shipping → Test Key).
// Nothing is saved except the label PDFs.

import { mkdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';

const SANDBOX_URL = 'https://apis-sandbox.fedex.com';
const SERVICE_TYPE = 'GROUND_HOME_DELIVERY';
const OUTPUT_DIR = 'fedex-sample-labels';

// Same FROM address as the live server
const SHIPPER = {
  contact: { personName: 'Forged Initials', phoneNumber: '8323528778' },
  address: {
    streetLines: ['16006 Crested Green Dr'],
    city: 'Houston',
    stateOrProvinceCode: 'TX',
    postalCode: '77082',
    countryCode: 'US',
  },
};

// Sample residential recipients: one in Texas, one out of state
const RECIPIENTS = [
  {
    contact: { personName: 'Sample Customer One', phoneNumber: '7135550101' },
    address: {
      streetLines: ['1500 McKinney St'],
      city: 'Houston',
      stateOrProvinceCode: 'TX',
      postalCode: '77010',
      countryCode: 'US',
      residential: true,
    },
  },
  {
    contact: { personName: 'Sample Customer Two', phoneNumber: '9015550102' },
    address: {
      streetLines: ['10 FedEx Pkwy'],
      city: 'Collierville',
      stateOrProvinceCode: 'TN',
      postalCode: '38017',
      countryCode: 'US',
      residential: true,
    },
  },
];

// One shared reader, so piped or pasted input isn't lost between questions
const rl = createInterface({ input: stdin, output: stdout, terminal: stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
let hideTyping = false;
rl._writeToOutput = (text) => {
  // Hide what's typed for keys so they don't show on screen
  if (!hideTyping) stdout.write(text);
};

async function ask(question, { hidden = false } = {}) {
  stdout.write(question);
  hideTyping = hidden;
  const { value } = await lines.next();
  hideTyping = false;
  if (hidden || !stdin.isTTY) stdout.write('\n');
  // Drop paste markers, spaces and other invisible characters a copy/paste can add
  return (value || '').replace(/\x1b\[20[01]~/g, '').replace(/[^\x21-\x7e]/g, '');
}

// Safe summary to compare against the portal without showing the keys
function describe(name, value, { showStart = false } = {}) {
  const start = showStart ? `starts with "${value.slice(0, 4)}", ` : '';
  return `${name}: ${start}${value.length} characters`;
}

async function getAccessToken(clientId, clientSecret) {
  const response = await fetch(`${SANDBOX_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`FedEx test login failed: ${JSON.stringify(data.errors || data)}`);
  return data.access_token;
}

async function createSampleLabel(accessToken, accountNumber, recipient) {
  const response = await fetch(`${SANDBOX_URL}/ship/v1/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify({
      labelResponseOptions: 'LABEL', // return the PDF itself instead of a link
      requestedShipment: {
        shipper: SHIPPER,
        recipients: [recipient],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: SERVICE_TYPE,
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION', // Packages are dropped off, not picked up
        blockInsightVisibility: false,
        shippingChargesPayment: { paymentType: 'SENDER' },
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_85X11_TOP_HALF_LABEL',
        },
        requestedPackageLineItems: [{ weight: { units: 'LB', value: 0.5 } }],
      },
      accountNumber: { value: accountNumber },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data.errors || data));

  const shipment = data.output.transactionShipments[0];
  const document = shipment.pieceResponses[0].packageDocuments[0];
  return { trackingNumber: shipment.masterTrackingNumber, pdfBase64: document.encodedLabel };
}

async function main() {
  console.log('FedEx sample labels (TEST environment, no charges)\n');
  console.log('Copy these from FedEx Developer Portal → forgedinitials-shipping → Test Key.\n');

  const clientId = await ask('Test API key: ', { hidden: true });
  const clientSecret = await ask('Test secret key: ', { hidden: true });
  const accountNumber = await ask('Test account number: ');
  rl.close();
  if (!clientId || !clientSecret || !accountNumber) {
    console.error('\nAll three are required. Nothing was created.');
    process.exit(1);
  }

  console.log(`\n${describe('Test API key', clientId, { showStart: true })}`);
  console.log(describe('Test secret key', clientSecret));
  if (clientSecret.includes('*')) {
    console.error('\nThe secret key is the hidden "*****" text from the page, not the real secret.');
    console.error('Click the eye or "show" icon next to it on the Test Key page, then copy it again.');
    process.exit(1);
  }

  const accessToken = await getAccessToken(clientId, clientSecret);
  console.log('\nLogged in to the FedEx test environment.');
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const [index, recipient] of RECIPIENTS.entries()) {
    const label = `${recipient.address.city}, ${recipient.address.stateOrProvinceCode}`;
    try {
      const { trackingNumber, pdfBase64 } = await createSampleLabel(accessToken, accountNumber, recipient);
      const file = `${OUTPUT_DIR}/sample-label-${index + 1}-${trackingNumber}.pdf`;
      await writeFile(file, Buffer.from(pdfBase64, 'base64'));
      console.log(`✅ ${label}: saved ${file}`);
    } catch (error) {
      console.error(`❌ ${label}: FedEx said ${error.message}`);
    }
  }

  console.log(`\nNext: print each PDF on a laser or inkjet printer, scan the printed page at 600 DPI or higher,`);
  console.log('and email the scans with the Label Cover Sheet to label@fedex.com.');
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
