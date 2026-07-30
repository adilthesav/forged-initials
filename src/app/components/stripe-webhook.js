const crypto = require('crypto');
const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

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
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      };
      const getRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=quantity_remaining`, { headers });
      const [prod] = await getRes.json();
      if (prod) {
        const newQty = Math.max(0, prod.quantity_remaining - parseInt(quantity || '1'));
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
          method: 'PATCH', headers,
          body: JSON.stringify({ quantity_remaining: newQty }),
        });
      }
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const amount = ((session.amount_total || 0) / 100).toFixed(2);
      const msg = `💰 NEW SALE!\n\nProduct ID: ${productId || 'unknown'}\nAmount: $${amount}\nCustomer: ${session.customer_details?.email || 'N/A'}\nShip to: ${session.customer_details?.name || 'N/A'}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg }),
      });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
