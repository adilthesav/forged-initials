// Public, but only with a private link: lets a customer change their own request before paying.
const {
  EDIT_OPTIONS, STRIPE_MIN_CENTS, json, clean, normalizeItems, normalizeCustomer, customerError, priceOrder, payUrl,
  getOrderByEditToken, saveOrder, telegram, esc, dollars, reconcile, closeCheckout, describeChanges,
} = require('../lib/orders.cjs');

const MAX_HISTORY = 50;
const editable = (order) => ['requested', 'approved'].includes(order.status);

// Phone order notes are written by the phone AI for the owner, so the customer gets their own field
const notesField = (order) => (order.source === 'phone' ? 'customerNotes' : 'notes');

function publicView(order) {
  if (!editable(order)) return { orderNumber: order.orderNumber, status: order.status, editable: false };
  const price = priceOrder(order);
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    editable: true,
    phoneOrder: order.source === 'phone',
    updatedAt: order.updatedAt,
    customer: order.customer,
    notes: order[notesField(order)] || '',
    letters: order.letters,
    bails: order.bails,
    prongs: order.prongs,
    shippingCents: price.shippingCents,
    adjustmentCents: price.adjustmentCents,
    adjustmentNote: order.adjustmentNote || '',
    totalCents: price.totalCents,
    options: EDIT_OPTIONS,
  };
}

function notifyOwner(order, entry) {
  return telegram(
    `✏️ <b>CUSTOMER EDITED: ${esc(order.orderNumber)}</b>\n\n` +
    `👤 ${esc(order.customer.name)}\n\n` +
    entry.changes.map((c) => `<b>${esc(c.field)}</b>\nWas: ${esc(c.before || 'none')}\nNow: ${esc(c.after || 'none')}`).join('\n\n') +
    `\n\n💵 ${dollars(entry.totalBeforeCents)} → ${dollars(entry.totalAfterCents)}` +
    (entry.closedPaymentLink ? `\n\n⚠️ The payment link was turned off. Approve the request again to send a new one.` : '') +
    `\n\nReview it at forged-initials.com/admin-orders`
  );
}

exports.handler = async (event) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) return json(405, { error: 'Method not allowed' });

  try {
    const body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const token = event.httpMethod === 'GET' ? event.queryStringParameters?.token : body.token;
    const found = await getOrderByEditToken(token);
    if (!found) return json(404, { error: 'This link is not valid.' });

    if (event.httpMethod === 'GET') {
      const { order } = await reconcile(found);
      return json(200, { order: publicView(order) });
    }

    if (!editable(found)) return json(409, { error: `This order is already ${found.status}, so it can't be changed here.`, order: publicView(found) });
    if (body.expectedUpdatedAt !== found.updatedAt) {
      return json(409, { error: 'Your request was just updated. Check the latest details, then make your changes again.', order: publicView(found) });
    }

    const phoneOrder = found.source === 'phone';
    const customer = normalizeCustomer(body);
    const items = normalizeItems(body);
    if (!items) return json(400, { error: 'Please check the letters and parts in your order.' });
    if (!items.letters.length && !items.bails.length && !items.prongs.length) return json(400, { error: 'Please keep at least one item. To cancel, please contact us.' });
    const problem = customerError(customer, { phoneOrder });
    if (problem) return json(400, { error: problem });

    const edited = { ...found, customer, ...items, [notesField(found)]: clean(body.details, 1000) };
    const changes = describeChanges(found, edited, notesField(found));
    if (!changes.length) return json(200, { order: publicView(found), changed: false });
    if (priceOrder(edited).totalCents < STRIPE_MIN_CENTS) return json(400, { error: 'Please contact us to make this change.' });

    const closed = await closeCheckout(found);
    if (closed.paid) return json(409, { error: 'This order is already paid, so it can\'t be changed here.', order: publicView(closed.paid) });

    const entry = {
      at: new Date().toISOString(),
      changes,
      totalBeforeCents: priceOrder(found).totalCents,
      totalAfterCents: priceOrder(edited).totalCents,
      closedPaymentLink: Boolean(payUrl(found)),
    };
    const saved = await saveOrder({
      ...edited,
      status: 'requested',
      payToken: null,
      linkExpiresAt: null,
      stripeSessionId: null,
      editsUnreviewed: true,
      customerEdits: [...(found.customerEdits || []), entry].slice(-MAX_HISTORY),
    });
    await notifyOwner(saved, entry);
    return json(200, { order: publicView(saved), changed: true });
  } catch (err) {
    console.error('⚠️ order-edit error:', err.message);
    return json(500, { error: 'Something went wrong. Please try again or message us.' });
  }
};
