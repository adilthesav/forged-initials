import * as kv from './kv_store.ts';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface ShipmentDetails {
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  carrier: 'fedex';
  service: string;
  status: 'pending' | 'label_created' | 'shipped' | 'in_transit' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

// FedEx API Configuration
// Use sandbox for testing, production for live shipments
const FEDEX_USE_SANDBOX = Deno.env.get('FEDEX_USE_SANDBOX') !== 'false'; // Default to sandbox
const FEDEX_USE_MOCK = Deno.env.get('FEDEX_USE_MOCK') === 'true'; // Mock mode for testing without real API
const FEDEX_API_URL = FEDEX_USE_SANDBOX 
  ? 'https://apis-sandbox.fedex.com' 
  : 'https://apis.fedex.com';
const FEDEX_AUTH_URL = `${FEDEX_API_URL}/oauth/token`;

console.log(`FedEx Mode: ${FEDEX_USE_MOCK ? 'MOCK (No API calls)' : FEDEX_USE_SANDBOX ? 'SANDBOX (Testing)' : 'PRODUCTION (Live)'}`);
console.log(`FedEx API URL: ${FEDEX_API_URL}`);

// Log environment setup on server start
if (!FEDEX_USE_MOCK) {
  const clientId = Deno.env.get('FEDEX_CLIENT_ID');
  const clientSecret = Deno.env.get('FEDEX_CLIENT_SECRET');
  const accountNumber = Deno.env.get('FEDEX_ACCOUNT_NUMBER');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 FedEx Shipping Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment: ${FEDEX_USE_SANDBOX ? '🧪 SANDBOX (Test)' : '🚀 PRODUCTION (Live)'}`);
  console.log(`API URL: ${FEDEX_API_URL}`);
  console.log(`Client ID: ${clientId ? `✓ Set (${clientId.substring(0, 15)}...)` : '✗ NOT SET'}`);
  console.log(`Client Secret: ${clientSecret ? '✓ Set' : '✗ NOT SET'}`);
  console.log(`Account Number: ${accountNumber ? `✓ Set (${accountNumber.substring(0, 3)}***)` : '✗ NOT SET'}`);
  console.log('');
  
  if (!clientId || !clientSecret || !accountNumber) {
    console.warn('⚠️  WARNING: FedEx credentials incomplete!');
    console.warn('   Orders will fall back to Mock Mode.');
    console.warn('   See FEDEX_SETUP_STEP_BY_STEP.md for setup.');
  } else {
    console.log('💡 IMPORTANT: Verify your credentials match the environment!');
    console.log(`   Your credentials should be for: ${FEDEX_USE_SANDBOX ? 'SANDBOX (Test)' : 'PRODUCTION (Live)'}`);
    console.log('   Use Testing Dashboard to verify: Click copyright 5x → Shipping → Verify Credentials');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

// Your business shipping address (FROM address)
const ORIGIN_ADDRESS: ShippingAddress = {
  fullName: 'Forged Initials',
  addressLine1: '16006 Crested Green Dr',
  city: 'Houston',
  stateOrProvinceCode: 'TX',
  postalCode: '77082',
  countryCode: 'US',
  phoneNumber: '8323528778',
};

/**
 * Get FedEx OAuth access token
 */
async function getFedExAccessToken(): Promise<string> {
  const clientId = Deno.env.get('FEDEX_CLIENT_ID');
  const clientSecret = Deno.env.get('FEDEX_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('FedEx API credentials not configured. Please set FEDEX_CLIENT_ID and FEDEX_CLIENT_SECRET environment variables.');
  }

  console.log(`Attempting FedEx authentication with URL: ${FEDEX_AUTH_URL}`);
  console.log(`Environment: ${FEDEX_USE_SANDBOX ? 'SANDBOX (Test)' : 'PRODUCTION (Live)'}`);
  console.log(`Client ID preview: ${clientId.substring(0, 15)}...`);

  const response = await fetch(FEDEX_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ FedEx authentication failed:', error);
    console.error('🔍 TROUBLESHOOTING:');
    console.error(`   • Current environment: ${FEDEX_USE_SANDBOX ? 'SANDBOX (Test)' : 'PRODUCTION (Live)'}`);
    console.error(`   • API URL: ${FEDEX_AUTH_URL}`);
    console.error(`   • Client ID starts with: ${clientId.substring(0, 15)}...`);
    console.error(`   • Status code: ${response.status}`);
    console.error('');
    console.error('💡 MOST LIKELY FIX:');
    if (FEDEX_USE_SANDBOX) {
      console.error('   Your credentials might be for PRODUCTION, not SANDBOX.');
      console.error('   → Try setting FEDEX_USE_SANDBOX=false in Supabase');
    } else {
      console.error('   Your credentials might be for SANDBOX, not PRODUCTION.');
      console.error('   → Try setting FEDEX_USE_SANDBOX=true in Supabase');
    }
    console.error('');
    console.error('📋 OTHER FIXES:');
    console.error('   1. Verify credentials at https://developer.fedex.com');
    console.error('   2. Check Ship API is enabled in your FedEx project');
    console.error('   3. See FEDEX_QUICK_FIX.md for step-by-step instructions');
    console.error('   4. Use Testing Dashboard → Shipping → "Verify FedEx Credentials"');
    
    throw new Error(`FedEx authentication failed: ${error}`);
  }

  const data = await response.json();
  console.log('✅ FedEx authentication successful');
  return data.access_token;
}

/**
 * Create FedEx shipment and generate shipping label
 */
export async function createFedExShipment(
  orderId: string,
  shippingAddress: ShippingAddress,
  packageDetails: {
    weight: number; // in lbs
    length?: number; // in inches
    width?: number;
    height?: number;
  }
): Promise<ShipmentDetails> {
  try {
    // Validate Houston-only shipping
    const city = shippingAddress.city.toLowerCase().trim();
    const state = shippingAddress.stateOrProvinceCode.toUpperCase().trim();
    
    if (state !== 'TX' || city !== 'houston') {
      throw new Error(`Shipping validation failed: We currently only ship to Houston, Texas. Provided address: ${shippingAddress.city}, ${shippingAddress.stateOrProvinceCode}`);
    }

    // MOCK MODE: Return fake shipping label for testing without API
    if (FEDEX_USE_MOCK) {
      console.log(`🎭 MOCK MODE: Creating fake FedEx shipment for order ${orderId}`);
      const mockTrackingNumber = `MOCK${Date.now()}`;
      const shipmentDetails: ShipmentDetails = {
        trackingNumber: mockTrackingNumber,
        labelUrl: 'https://example.com/mock-label.pdf',
        carrier: 'fedex',
        service: 'FEDEX_GROUND',
        status: 'label_created',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store shipment details with order
      await kv.set(`shipment:${orderId}`, shipmentDetails);
      await kv.set(`tracking:${mockTrackingNumber}`, orderId);

      console.log(`🎭 Mock FedEx shipment created for order ${orderId}: ${mockTrackingNumber}`);
      return shipmentDetails;
    }

    const accessToken = await getFedExAccessToken();

    // FedEx Ship API request
    const shipmentRequest = {
      labelResponseOptions: 'URL_ONLY',
      requestedShipment: {
        shipper: {
          contact: {
            personName: ORIGIN_ADDRESS.fullName,
            phoneNumber: ORIGIN_ADDRESS.phoneNumber,
          },
          address: {
            streetLines: [ORIGIN_ADDRESS.addressLine1],
            city: ORIGIN_ADDRESS.city,
            stateOrProvinceCode: ORIGIN_ADDRESS.stateOrProvinceCode,
            postalCode: ORIGIN_ADDRESS.postalCode,
            countryCode: ORIGIN_ADDRESS.countryCode,
          },
        },
        recipients: [
          {
            contact: {
              personName: shippingAddress.fullName,
              phoneNumber: shippingAddress.phoneNumber,
            },
            address: {
              streetLines: [
                shippingAddress.addressLine1,
                ...(shippingAddress.addressLine2 ? [shippingAddress.addressLine2] : []),
              ],
              city: shippingAddress.city,
              stateOrProvinceCode: shippingAddress.stateOrProvinceCode,
              postalCode: shippingAddress.postalCode,
              countryCode: shippingAddress.countryCode,
              residential: true,
            },
          },
        ],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: 'FEDEX_GROUND', // Free shipping using ground
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'USE_SCHEDULED_PICKUP',
        blockInsightVisibility: false,
        shippingChargesPayment: {
          paymentType: 'SENDER',
        },
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_85X11_TOP_HALF_LABEL',
        },
        requestedPackageLineItems: [
          {
            weight: {
              units: 'LB',
              value: packageDetails.weight,
            },
            ...(packageDetails.length && packageDetails.width && packageDetails.height
              ? {
                  dimensions: {
                    length: packageDetails.length,
                    width: packageDetails.width,
                    height: packageDetails.height,
                    units: 'IN',
                  },
                }
              : {}),
          },
        ],
      },
      accountNumber: {
        value: Deno.env.get('FEDEX_ACCOUNT_NUMBER'),
      },
    };

    const response = await fetch(`${FEDEX_API_URL}/ship/v1/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-locale': 'en_US',
      },
      body: JSON.stringify(shipmentRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('FedEx shipment creation error:', error);
      console.error('❌ FEDEX API ERROR DETAILS:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: error,
        requestedService: 'FEDEX_GROUND',
        destination: shippingAddress.city
      });
      throw new Error(`FedEx shipment failed: ${error}`);
    }

    const data = await response.json();
    const trackingNumber = data.output.transactionShipments[0].masterTrackingNumber;
    const labelUrl = data.output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url;

    const shipmentDetails: ShipmentDetails = {
      trackingNumber,
      labelUrl,
      carrier: 'fedex',
      service: 'FEDEX_GROUND',
      status: 'label_created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store shipment details with order
    await kv.set(`shipment:${orderId}`, shipmentDetails);
    await kv.set(`tracking:${trackingNumber}`, orderId);

    console.log(`FedEx shipment created for order ${orderId}: ${trackingNumber}`);
    return shipmentDetails;
  } catch (error) {
    console.error(`Error creating FedEx shipment for order ${orderId}:`, error);
    
    // AUTO-FALLBACK TO MOCK MODE if FedEx API fails
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isFedExAuthError = errorMessage.includes('FedEx authentication failed') || 
                             errorMessage.includes('FORBIDDEN.ERROR') ||
                             errorMessage.includes('could not authorize');
    
    if (isFedExAuthError && !FEDEX_USE_MOCK) {
      console.warn(`⚠️ FedEx API authentication failed - falling back to MOCK MODE for order ${orderId}`);
      console.warn('💡 To use real FedEx API, fix credentials or set FEDEX_USE_MOCK=true to acknowledge mock mode');
      
      // Create mock shipment as fallback
      const mockTrackingNumber = `MOCK-FALLBACK-${Date.now()}`;
      const mockShipment: ShipmentDetails = {
        trackingNumber: mockTrackingNumber,
        labelUrl: 'https://example.com/mock-fallback-label.pdf',
        carrier: 'fedex',
        service: 'FEDEX_GROUND',
        status: 'pending', // Mark as pending since it's a fallback
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store mock shipment details
      await kv.set(`shipment:${orderId}`, mockShipment);
      await kv.set(`tracking:${mockTrackingNumber}`, orderId);

      console.log(`🎭 AUTO-FALLBACK: Mock shipment created for order ${orderId}: ${mockTrackingNumber}`);
      
      // Return the mock shipment instead of throwing error
      return mockShipment;
    }
    
    // Store pending shipment status for other errors
    const pendingShipment: ShipmentDetails = {
      carrier: 'fedex',
      service: 'FEDEX_GROUND',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`shipment:${orderId}`, pendingShipment);
    
    throw error;
  }
}

/**
 * Track FedEx shipment
 */
export async function trackFedExShipment(trackingNumber: string): Promise<any> {
  try {
    const accessToken = await getFedExAccessToken();

    const trackRequest = {
      includeDetailedScans: true,
      trackingInfo: [
        {
          trackingNumberInfo: {
            trackingNumber,
          },
        },
      ],
    };

    const response = await fetch(`${FEDEX_API_URL}/track/v1/trackingnumbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-locale': 'en_US',
      },
      body: JSON.stringify(trackRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FedEx tracking failed: ${error}`);
    }

    const data = await response.json();
    return data.output.completeTrackResults[0].trackResults[0];
  } catch (error) {
    console.error(`Error tracking FedEx shipment ${trackingNumber}:`, error);
    throw error;
  }
}

/**
 * Get shipment details for an order
 */
export async function getShipmentDetails(orderId: string): Promise<ShipmentDetails | null> {
  try {
    const shipment = await kv.get(`shipment:${orderId}`);
    return shipment;
  } catch (error) {
    console.error(`Error fetching shipment for order ${orderId}:`, error);
    return null;
  }
}

/**
 * Calculate estimated package weight based on order details
 * Jewelry is light - estimate based on quantity and material
 */
export function estimatePackageWeight(quantity: number, material: string): number {
  // Base weight in lbs (jewelry is very light)
  const baseWeight = 0.1; // 0.1 lbs per piece (very conservative estimate)
  const packagingWeight = 0.2; // Box, padding, etc.
  
  return Math.max(0.5, (baseWeight * quantity) + packagingWeight); // Min 0.5 lbs
}