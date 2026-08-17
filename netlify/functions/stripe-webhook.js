const crypto = require('crypto');
const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(',');
  const timestamp = (parts.find(p => p.startsWith('t=')) || '').slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!timestamp || !signatures.length) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some(sig => {
    try { return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex')); }
    catch { return false; }
  });
}

async function getCJToken() {
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_EMAIL, password: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  return data.data?.accessToken || null;
}

async function createCJOrder(cjVid, quantity, session) {
  const token = await getCJToken();
  if (!token) { console.error('⚠️ CJ token failed'); return; }

  const shipping = session.shipping_details;
  if (!shipping?.address) { console.error('⚠️ No shipping address in session'); return; }

  const addr = shipping.address;
  const orderNumber = `FI-${Date.now()}-${session.id.slice(-6).toUpperCase()}`;

  const payload = {
    orderNumber,
    shippingCustomerName: shipping.name || session.customer_details?.name || 'Customer',
    shippingAddress: [addr.line1, addr.line2].filter(Boolean).join(', '),
    shippingCity: addr.city || '',
    shippingProvince: addr.state || '',
    shippingZip: addr.postal_code || '',
    shippingCountry: 'United States',
    shippingCountryCode: addr.country || 'US',
    shippingPhone: session.customer_details?.phone || '0000000000',
    shippingEmail: session.customer_details?.email || '',
    products: [{ vid: cjVid, quantity: parseInt(quantity || '1') }],
  };

  const res = await fetch(`${CJ_BASE}/shopping/order/createOrderV2`, {
    method: 'POST',
    headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log('CJ order response:', JSON.stringify(data));
  return data;
}

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (secret && sig) {
    if (!verifyStripeSignature(event.body, sig, secret)) {
      return { statusCode: 400, body: 'Invalid signature' };
    }
  }

  let stripeEvent;
  try { stripeEvent = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const { productId, quantity } = session.metadata || {};

    if (productId) {
      const headers = {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      };

      // Fetch product (including CJ fields)
      const getRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=quantity_remaining,cj_pid,cj_vid`,
        { headers }
      );
      const [prod] = await getRes.json();

      if (prod) {
        // Decrement stock
        const newQty = Math.max(0, prod.quantity_remaining - parseInt(quantity || '1'));
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ quantity_remaining: newQty }),
        });

        // Auto-fulfill via CJ if product is linked
        if (prod.cj_vid) {
          try {
            await createCJOrder(prod.cj_vid, quantity || '1', session);
            console.log('✅ CJ order submitted for product', productId);
          } catch (err) {
            console.error('⚠️ CJ fulfillment error:', err.message);
          }
        }
      }
    }

    // Telegram sale alert
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const amount = ((session.amount_total || 0) / 100).toFixed(2);
      const city = session.shipping_details?.address?.city || 'N/A';
      const email = session.customer_details?.email || 'N/A';
      const msg = `💰 NEW SALE!\n\nAmount: $${amount}\nCustomer: ${email}\nShip to: ${city}\nProduct ID: ${productId || '?'}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
