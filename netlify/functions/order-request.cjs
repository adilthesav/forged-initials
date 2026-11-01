// Public: a customer sends a custom order request. No payment happens here.
const { json, clean, normalizeItems, normalizeCustomer, customerError, priceOrder, editUrl, saveOrder, telegram, esc, dollars, newId, newToken } = require('../lib/orders.cjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  // Hidden form field that only bots fill in: pretend it worked and store nothing
  if (body.website) return json(200, { orderNumber: 'FI-RECEIVED' });

  const customer = normalizeCustomer(body);
  const items = normalizeItems(body);
  if (!items) return json(400, { error: 'Please check the letters and parts in your order.' });
  if (!items.letters.length && !items.bails.length && !items.prongs.length) return json(400, { error: 'Please add at least one item.' });
  const problem = customerError(customer);
  if (problem) return json(400, { error: problem });

  const id = newId();
  const order = {
    id,
    orderNumber: `FI-${id.slice(0, 6).toUpperCase()}`,
    status: 'requested',
    editToken: newToken(),
    createdAt: new Date().toISOString(),
    customer,
    notes: clean(body.details, 1000),
    ...items,
    adjustmentCents: 0,
  };

  try {
    await saveOrder(order);
  } catch (err) {
    console.error('⚠️ Could not save order request:', err.message);
    return json(500, { error: 'Something went wrong. Please try again or message us.' });
  }

  const price = priceOrder(order);
  await telegram(
    `🧾 <b>NEW ORDER REQUEST: ${esc(order.orderNumber)}</b>\n\n` +
    `👤 ${esc(customer.name)}\n📧 ${esc(customer.email)}\n` +
    (customer.phone ? `📱 ${esc(customer.phone)}\n` : '') +
    `📍 ${esc(customer.city)}, ${esc(customer.state)}\n\n` +
    price.lines.map((l) => `• ${esc(l.label)} ×${l.quantity}`).join('\n') +
    `\n\n💵 Estimated total: ${dollars(price.totalCents)}` +
    (order.notes ? `\n\n📝 ${esc(order.notes)}` : '') +
    `\n\nReview it at forged-initials.com/admin-orders`
  );

  return json(200, { orderNumber: order.orderNumber, editUrl: editUrl(order) });
};
