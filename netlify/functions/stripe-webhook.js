const crypto = require('crypto');
const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(',');
  const timestamp = (parts.find(p => p.startsWith('t=')) || '').slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!timestamp || !signatures.length) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  return signatures.some(sig => {
    try { return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex')); }
    catch { return false; }
  });
}

async function getCJToken() {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_EMAIL, password: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  if (!data.data?.accessToken) throw new Error('CJ auth failed');
  return data.data.accessToken;
}

async function createCJOrder(vid, quantity, session) {
  const token = await getCJToken();
  const ship = session.shipping_details || {};
  const addr = ship.address || {};
  const phone = session.customer_details?.phone || '';
  const email = session.customer_details?.email || '';
  const name = ship.name || session.customer_details?.name || 'Customer';

  const payload = {
    orderNumber: `FI-${Date.now()}`,
    shippingZip: addr.postal_code || '',
    shippingCountryCode: addr.country || 'US',
    shippingCountry: 'United States',
    shippingProvince: addr.state || '',
    shippingCity: addr.city || '',
    shippingAddress: addr.line1 || '',
    shippingAddress2: addr.line2 || '',
    shippingCustomerName: name,
    shippingPhone: phone.replace(/\D/g, '') || '0000000000',
    remark: 'Forged Initials order',
    email,
    products: [{ vid, quantity: parseInt(quantity) || 1 }],
  };

  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('CJ order result:', JSON.stringify(data));
  return data;
}

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secret && sig) {
    const valid = verifyStripeSignature(event.body, sig, secret);
    if (!valid) return { statusCode: 400, body: 'Invalid signature' };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const { productId, quantity, selectedVid } = session.metadata || {};

    const supaHeaders = {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Fetch product + CJ fields
    let prod = null;
    if (productId) {
      const getRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=quantity_remaining,name,cj_pid,cj_vid,variants`,
        { headers: supaHeaders }
      );
      [prod] = await getRes.json();
    }

    // Decrement stock
    if (prod) {
      const newQty = Math.max(0, prod.quantity_remaining - parseInt(quantity || '1'));
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: supaHeaders,
        body: JSON.stringify({ quantity_remaining: newQty }),
      });
    }

    // Submit CJ order — use selectedVid from checkout, or fall back to product.cj_vid
    const vidToUse = selectedVid || (prod && prod.cj_vid) || '';
    if (vidToUse && prod) {
      try {
        await createCJOrder(vidToUse, quantity || '1', session);
      } catch (err) {
        console.error('CJ order failed:', err.message);
      }
    }

    // Telegram notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const amount = ((session.amount_total || 0) / 100).toFixed(2);
      const city = session.shipping_details?.address?.city || '';
      const msg = [
        '💰 NEW SALE!',
        '',
        `Product: ${prod?.name || productId || 'unknown'}`,
        `Amount: $${amount}`,
        `Customer: ${session.customer_details?.email || 'N/A'}`,
        city ? `Ships to: ${city}` : '',
        vidToUse ? `CJ vid: ${vidToUse}` : '',
      ].filter(Boolean).join('\n');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      }).catch(() => {});
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
