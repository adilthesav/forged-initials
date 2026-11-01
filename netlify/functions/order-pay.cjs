// Public, but only with a private link: shows one approved order and starts its checkout.
const { json, priceOrder, siteUrl, getOrderByToken, saveOrder, stripe, reconcile } = require('../lib/orders.cjs');

function publicView(order) {
  const price = priceOrder(order);
  const c = order.customer;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    expired: isExpired(order),
    name: c.name,
    shipTo: c.addressLine1 ? [c.addressLine1, c.addressLine2, `${c.city}, ${c.state} ${c.postalCode}`].filter(Boolean) : ['You\'ll enter your address at checkout'],
    lines: price.lines,
    subtotalCents: price.subtotalCents,
    shippingCents: price.shippingCents,
    adjustmentCents: price.adjustmentCents,
    adjustmentNote: order.adjustmentNote || '',
    totalCents: price.totalCents,
  };
}

function isExpired(order) {
  return order.status === 'approved' && (!order.linkExpiresAt || Date.parse(order.linkExpiresAt) < Date.now());
}

async function startCheckout(order) {
  const { order: latest, session: existing } = await reconcile(order);
  if (latest.status !== 'approved') return { order: latest };
  if (existing?.status === 'open' && existing.url) return { order: latest, url: existing.url };

  const attempts = (latest.stripeAttempts || 0) + (latest.stripeSessionId ? 1 : 0);
  const price = priceOrder(latest);
  const form = new URLSearchParams();
  form.append('mode', 'payment');
  for (const m of ['card', 'cashapp', 'link']) form.append('payment_method_types[]', m);
  form.append('line_items[0][quantity]', '1');
  form.append('line_items[0][price_data][currency]', 'usd');
  form.append('line_items[0][price_data][unit_amount]', String(price.totalCents));
  form.append('line_items[0][price_data][product_data][name]', `Forged Initials custom order ${latest.orderNumber}`);
  form.append('line_items[0][price_data][product_data][description]', price.lines.map((l) => `${l.label} x${l.quantity}`).join(', ').slice(0, 450) + ' + shipping');
  if (latest.customer.email) form.append('customer_email', latest.customer.email);
  // Phone orders have no address on file, so Stripe collects it
  if (!latest.customer.addressLine1) form.append('shipping_address_collection[allowed_countries][]', 'US');
  form.append('success_url', `${siteUrl()}/pay/${latest.payToken}`);
  form.append('cancel_url', `${siteUrl()}/pay/${latest.payToken}`);
  form.append('metadata[orderRequestId]', latest.id);
  form.append('metadata[orderNumber]', latest.orderNumber);

  // Double clicks reuse one session instead of opening two
  const session = await stripe('checkout/sessions', { form, idempotencyKey: `order-${latest.payToken}-${attempts}` });
  await saveOrder({ ...latest, stripeSessionId: session.id, stripeAttempts: attempts });
  return { order: latest, url: session.url };
}

exports.handler = async (event) => {
  try {
    const token = event.httpMethod === 'GET' ? event.queryStringParameters?.token : JSON.parse(event.body || '{}').token;
    if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { error: 'Method not allowed' });

    const found = await getOrderByToken(token);
    if (!found) return json(404, { error: 'This payment link is not valid.' });

    if (event.httpMethod === 'GET') {
      const { order } = await reconcile(found);
      return json(200, { order: publicView(order) });
    }

    if (isExpired(found)) return json(410, { error: 'This payment link has expired. Please contact us for a new one.' });
    const { order, url } = await startCheckout(found);
    if (!url) return json(409, { order: publicView(order), error: order.status === 'paid' ? 'This order is already paid.' : 'This order is not ready for payment.' });
    return json(200, { url });
  } catch (err) {
    console.error('⚠️ order-pay error:', err.message);
    return json(500, { error: 'Something went wrong. Please try again or message us.' });
  }
};
