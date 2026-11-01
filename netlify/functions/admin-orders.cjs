// Owner only: review order requests, edit them, and create private payment links.
const crypto = require('crypto');
const {
  LINK_DAYS, STRIPE_MIN_CENTS, json, clean, normalizeItems, priceOrder, payUrl, getOrder, listOrders, saveOrder,
  newToken, stripe, reconcile,
} = require('../lib/orders.cjs');

function isAuthorized(headers, secret) {
  const given = headers['x-orders-token'] || headers['X-Orders-Token'] || '';
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

const present = (order) => ({ ...order, price: priceOrder(order), payUrl: payUrl(order) });

// Stops an unpaid checkout so an old link can't be paid after the order changes.
// If the customer already paid, reconcile marks it paid and it comes back as { paid }.
async function closeCheckout(order) {
  const { order: latest, session } = await reconcile(order);
  if (latest.status === 'paid') return { paid: latest };
  if (session?.status === 'open') await stripe(`checkout/sessions/${encodeURIComponent(session.id)}/expire`, { method: 'POST' });
  return { order: latest };
}

exports.handler = async (event) => {
  const secret = process.env.ORDERS_ADMIN_TOKEN;
  if (!secret) {
    console.error('⚠️ ORDERS_ADMIN_TOKEN is not set');
    return json(500, { error: 'Not configured' });
  }
  if (!isAuthorized(event.headers || {}, secret)) return json(401, { error: 'Unauthorized' });

  try {
    if (event.httpMethod === 'GET') return json(200, { orders: (await listOrders()).map(present) });
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

    const body = JSON.parse(event.body || '{}');
    const order = await getOrder(body.id);
    if (!order) return json(404, { error: 'Order not found' });

    if (body.action === 'update') {
      if (order.status !== 'requested') return json(409, { error: 'Reopen this order before editing it.' });
      const items = normalizeItems(body);
      const adjustmentCents = Math.round(Number(body.adjustmentDollars || 0) * 100);
      if (!items || !Number.isFinite(adjustmentCents)) return json(400, { error: 'Check the items and adjustment.' });
      const next = { ...order, ...items, adjustmentCents, adjustmentNote: clean(body.adjustmentNote, 200), ownerNotes: clean(body.ownerNotes, 2000) };
      if (priceOrder(next).totalCents < STRIPE_MIN_CENTS) return json(400, { error: 'The total must be at least $0.50.' });
      return json(200, { order: present(await saveOrder(next)) });
    }

    if (body.action === 'approve') {
      if (order.status !== 'requested') return json(409, { error: 'Only a new request can be approved.' });
      const next = {
        ...order,
        status: 'approved',
        payToken: newToken(),
        approvedAt: new Date().toISOString(),
        linkExpiresAt: new Date(Date.now() + LINK_DAYS * 86400000).toISOString(),
        stripeSessionId: null,
        stripeAttempts: 0,
      };
      return json(200, { order: present(await saveOrder(next)) });
    }

    if (body.action === 'reopen' || body.action === 'cancel') {
      if (!['requested', 'approved'].includes(order.status)) return json(409, { error: `This order is already ${order.status}.` });
      const closed = await closeCheckout(order);
      if (closed.paid) return json(409, { error: 'The customer has already paid this order.', order: present(closed.paid) });
      const next = { ...closed.order, status: body.action === 'cancel' ? 'cancelled' : 'requested', payToken: null, linkExpiresAt: null, stripeSessionId: null };
      return json(200, { order: present(await saveOrder(next)) });
    }

    return json(400, { error: 'Unknown action' });
  } catch (err) {
    console.error('⚠️ admin-orders error:', err.message);
    return json(500, { error: 'Something went wrong.' });
  }
};
