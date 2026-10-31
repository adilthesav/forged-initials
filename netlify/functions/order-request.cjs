// Public: a customer sends a custom order request. No payment happens here.
const { json, clean, normalizeItems, priceOrder, saveOrder, telegram, esc, dollars, newId } = require('../lib/orders.cjs');

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

  const customer = {
    name: clean(body.customerName, 100),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phoneNumber, 30),
    addressLine1: clean(body.addressLine1, 150),
    addressLine2: clean(body.addressLine2, 150),
    city: clean(body.city, 80),
    state: clean(body.stateOrProvinceCode, 2).toUpperCase(),
    postalCode: clean(body.postalCode, 12),
  };
  const items = normalizeItems(body);
  if (!items) return json(400, { error: 'Please check the letters and parts in your order.' });
  if (!items.letters.length && !items.bails.length && !items.prongs.length) return json(400, { error: 'Please add at least one item.' });
  if (!customer.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return json(400, { error: 'Please enter your name and a valid email.' });
  if (!customer.addressLine1 || !customer.city || !/^[A-Z]{2}$/.test(customer.state) || !customer.postalCode) return json(400, { error: 'Please enter your full U.S. shipping address.' });

  const id = newId();
  const order = {
    id,
    orderNumber: `FI-${id.slice(0, 6).toUpperCase()}`,
    status: 'requested',
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

  return json(200, { orderNumber: order.orderNumber });
};
