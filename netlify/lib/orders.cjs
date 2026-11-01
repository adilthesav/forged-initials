// Shared helpers for custom order requests and their private payment links.
// Orders live in the existing kv_store table under the key order_request:<id>.
const crypto = require('crypto');

const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const TABLE = 'kv_store_6ca24691';
const PREFIX = 'order_request:';
const LINK_DAYS = 7;
const SHIPPING_CENTS = 1000;
const STRIPE_MIN_CENTS = 50;

// Prices are always set here on the server, never taken from the browser
const LETTER_CENTS = { 'extra-small': 100, small: 200, medium: 300, large: 400, 'extra-large': 500 };
const BAIL_CENTS = { xs: 150, s: 200, m: 250, l: 300 };
const PRONG_CENTS = { 'half-carat': 175, '1-carat': 275 };
const PRONG_LABELS = { 'half-carat': '½ carat', '1-carat': '1 carat' };

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) };
}

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function quantity(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 500 ? n : null;
}

// Keeps only valid lines. Returns null if anything is invalid so bad input is rejected, not guessed at.
function normalizeItems({ letters = [], bails = [], prongs = [] }) {
  if (![letters, bails, prongs].every(Array.isArray) || letters.length + bails.length + prongs.length > 60) return null;
  const out = { letters: [], bails: [], prongs: [] };
  for (const l of letters) {
    const letter = String(l?.letter ?? '').toUpperCase().trim();
    const qty = quantity(l?.quantity);
    if (!/^[A-Z]$/.test(letter) || !LETTER_CENTS[l?.size] || !qty) return null;
    out.letters.push({ letter, size: l.size, quantity: qty });
  }
  for (const [list, table, key] of [[bails, BAIL_CENTS, 'bails'], [prongs, PRONG_CENTS, 'prongs']]) {
    for (const p of list) {
      const size = String(p?.size ?? '').toLowerCase();
      const qty = quantity(p?.quantity);
      if (!table[size] || !qty) return null;
      out[key].push({ size, quantity: qty });
    }
  }
  return out;
}

// What a customer can choose when editing, using the same prices as the server
const EDIT_OPTIONS = {
  letterSizes: Object.entries(LETTER_CENTS).map(([value, cents]) => ({ value, label: value.replace('-', ' '), cents })),
  bails: Object.entries(BAIL_CENTS).map(([value, cents]) => ({ value, label: value.toUpperCase(), cents })),
  prongs: Object.entries(PRONG_CENTS).map(([value, cents]) => ({ value, label: PRONG_LABELS[value], cents })),
};

// Reads the same contact fields the custom order form sends
function normalizeCustomer(body) {
  return {
    name: clean(body.customerName, 100),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phoneNumber, 30),
    addressLine1: clean(body.addressLine1, 150),
    addressLine2: clean(body.addressLine2, 150),
    city: clean(body.city, 80),
    state: clean(body.stateOrProvinceCode, 2).toUpperCase(),
    postalCode: clean(body.postalCode, 12),
  };
}

// Phone orders may have no email or address yet, since Stripe collects the address at checkout.
function customerError(customer, { phoneOrder = false } = {}) {
  if (!customer.name) return 'Please enter your name.';
  if ((!phoneOrder || customer.email) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return 'Please enter your name and a valid email.';
  if (phoneOrder && !customer.addressLine1) return null;
  if (!customer.addressLine1 || !customer.city || !/^[A-Z]{2}$/.test(customer.state) || !customer.postalCode) return 'Please enter your full U.S. shipping address.';
  return null;
}

function priceOrder(order) {
  const lines = [
    ...order.letters.map((l) => ({ label: `${l.letter}, ${l.size.replace('-', ' ')}`, quantity: l.quantity, cents: LETTER_CENTS[l.size] * l.quantity })),
    ...order.bails.map((b) => ({ label: `${b.size.toUpperCase()} bail`, quantity: b.quantity, cents: BAIL_CENTS[b.size] * b.quantity })),
    ...order.prongs.map((p) => ({ label: `${PRONG_LABELS[p.size]} prong`, quantity: p.quantity, cents: PRONG_CENTS[p.size] * p.quantity })),
  ];
  const subtotalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  const adjustmentCents = order.adjustmentCents || 0;
  return { lines, subtotalCents, shippingCents: SHIPPING_CENTS, adjustmentCents, totalCents: subtotalCents + SHIPPING_CENTS + adjustmentCents };
}

function siteUrl() {
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production' && process.env.DEPLOY_PRIME_URL) return process.env.DEPLOY_PRIME_URL;
  return 'https://forged-initials.com';
}

function payUrl(order) {
  return order.payToken ? `${siteUrl()}/pay/${order.payToken}` : null;
}

function editUrl(order) {
  return order.editToken ? `${siteUrl()}/request/${order.editToken}` : null;
}

function kvHeaders(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

async function kvRows(query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?${query}`, { headers: kvHeaders() });
  if (!r.ok) throw new Error(`Storage read failed: ${r.status}`);
  return r.json();
}

async function getOrder(id) {
  if (!/^[a-f0-9]{12}$/.test(String(id))) return null;
  const rows = await kvRows(`key=eq.${PREFIX}${id}&select=value`);
  return rows[0]?.value || null;
}

async function getOrderByField(field, token) {
  if (!/^[A-Za-z0-9_-]{22}$/.test(String(token))) return null;
  const rows = await kvRows(`key=like.${PREFIX}*&value->>${field}=eq.${token}&select=value`);
  return rows[0]?.value || null;
}

const getOrderByToken = (token) => getOrderByField('payToken', token);
const getOrderByEditToken = (token) => getOrderByField('editToken', token);

async function listOrders() {
  const rows = await kvRows(`key=like.${PREFIX}*&select=value`);
  return rows.map((r) => r.value).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function saveOrder(order) {
  const next = { ...order, updatedAt: new Date().toISOString() };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: kvHeaders({ Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify({ key: `${PREFIX}${order.id}`, value: next }),
  });
  if (!r.ok) throw new Error(`Storage write failed: ${r.status}`);
  return next;
}

async function telegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return console.error('⚠️ Telegram is not configured');
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!r.ok) console.error('⚠️ Telegram error:', r.status);
  } catch (err) {
    console.error('⚠️ Telegram error:', err.message);
  }
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function dollars(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

async function stripe(path, { form, method = form ? 'POST' : 'GET', idempotencyKey } = {}) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    ...(form ? { body: form.toString() } : {}),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Stripe error ${r.status}`);
  return data;
}

// Marks the order paid once, however many times a webhook or page load reports it.
async function markPaid(order, session) {
  if (order.status === 'paid') return order;
  const paid = await saveOrder({
    ...order,
    status: 'paid',
    paidAt: new Date().toISOString(),
    paidCents: session.amount_total,
    paymentIntent: session.payment_intent || null,
    stripeShipping: session.shipping_details || null,
  });
  await telegram(
    `💰 <b>ORDER PAID: ${esc(order.orderNumber)}</b>\n\n` +
    `👤 ${esc(order.customer.name)}\n💵 ${dollars(session.amount_total || 0)}\n` +
    (session.shipping_details?.address ? `📍 Ship to: ${esc(formatStripeAddress(session.shipping_details))}\n` : '') +
    `\n` +
    `Next: make the piece and create the shipping label by hand.`
  );
  return paid;
}

function formatStripeAddress({ name, address: a }) {
  return [name, a.line1, a.line2, a.city, a.state, a.postal_code].filter(Boolean).join(', ');
}

// Checks the order's Stripe session, so a payment is noticed even if a webhook is missed.
async function reconcile(order) {
  if (!order.stripeSessionId || order.status === 'paid') return { order, session: null };
  const session = await stripe(`checkout/sessions/${encodeURIComponent(order.stripeSessionId)}`);
  if (session.payment_status === 'paid') return { order: await markPaid(order, session), session };
  return { order, session };
}

// Stops an unpaid checkout so an old link can't be paid after the order changes.
// If the customer already paid, reconcile marks it paid and it comes back as { paid }.
async function closeCheckout(order) {
  const { order: latest, session } = await reconcile(order);
  if (latest.status === 'paid') return { paid: latest };
  if (session?.status === 'open') await stripe(`checkout/sessions/${encodeURIComponent(session.id)}/expire`, { method: 'POST' });
  return { order: latest };
}

const addressText = (c) => [c.addressLine1, c.addressLine2, c.city, [c.state, c.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
const letterText = (l) => `${l.letter} ${l.size.replace('-', ' ')} ×${l.quantity}`;
const bailText = (b) => `${b.size.toUpperCase()} bail ×${b.quantity}`;
const prongText = (p) => `${PRONG_LABELS[p.size]} prong ×${p.quantity}`;

// Lines in `from` that aren't in `to`, counting repeats, so reordering isn't a change
function missingLines(from, to) {
  const rest = [...to];
  return from.filter((line) => {
    const i = rest.indexOf(line);
    if (i === -1) return true;
    rest.splice(i, 1);
    return false;
  });
}

// A plain list of what changed, for the owner. Item lists only show the lines that differ.
function describeChanges(before, after, notesKey) {
  const changes = [];
  const scalar = (field, a, b) => { if (a !== b) changes.push({ field, before: a, after: b }); };
  scalar('Name', before.customer.name, after.customer.name);
  scalar('Email', before.customer.email, after.customer.email);
  scalar('Phone', before.customer.phone, after.customer.phone);
  scalar('Shipping address', addressText(before.customer), addressText(after.customer));
  for (const [field, key, text] of [['Letters', 'letters', letterText], ['Bails', 'bails', bailText], ['Prongs', 'prongs', prongText]]) {
    const was = before[key].map(text);
    const now = after[key].map(text);
    const removed = missingLines(was, now);
    const added = missingLines(now, was);
    if (removed.length || added.length) changes.push({ field, before: removed.join(', '), after: added.join(', ') });
  }
  scalar('Notes', before[notesKey] || '', after[notesKey] || '');
  return changes;
}

function newToken() {
  return crypto.randomBytes(16).toString('base64url');
}

function newId() {
  return crypto.randomBytes(6).toString('hex');
}

// Vapi's form sends items as text, like "S, Medium, 2; J, Large, 1"
function parseCallLines(value, keys) {
  if (Array.isArray(value)) return value;
  return String(value ?? '').split(';').map((line) => line.split(',').map((part) => part.trim())).filter((parts) => parts[0])
    .map((parts) => Object.fromEntries(keys.map((key, i) => [key, parts[i] || undefined])));
}

// Turns what the phone AI heard into order lines, skipping anything unclear for the owner to confirm.
function itemsFromCall(request) {
  const letters = [];
  const bails = [];
  const prongs = [];
  for (const l of parseCallLines(request?.letters, ['letter', 'size', 'quantity'])) {
    const size = String(l?.size ?? 'medium').toLowerCase().trim().replace(/\s+/g, '-');
    const line = normalizeItems({ letters: [{ letter: l?.letter, size, quantity: l?.quantity ?? 1 }] });
    if (line) letters.push(...line.letters);
  }
  for (const p of parseCallLines(request?.parts, ['item', 'size', 'quantity'])) {
    const item = String(p?.item ?? '').toLowerCase();
    const quantity = p?.quantity ?? 1;
    if (item.includes('prong')) {
      const size = /half|½|1\/2/.test(item) ? 'half-carat' : /one|1/.test(item) ? '1-carat' : null;
      const line = size && normalizeItems({ prongs: [{ size, quantity }] });
      if (line) prongs.push(...line.prongs);
    } else if (item.includes('bail')) {
      const word = String(p?.size ?? '').toLowerCase().trim();
      const size = { 'extra small': 'xs', xs: 'xs', small: 's', s: 's', medium: 'm', m: 'm', large: 'l', l: 'l' }[word];
      const line = size && normalizeItems({ bails: [{ size, quantity }] });
      if (line) bails.push(...line.bails);
    }
  }
  return { letters, bails, prongs };
}

// Saves a phone order as a request. A retried report for the same call gets the same request back.
async function saveCallRequest(callId, caller, request) {
  const items = itemsFromCall(request);
  if (!items.letters.length && !items.bails.length && !items.prongs.length) return null;
  const id = crypto.createHash('sha256').update(String(callId || crypto.randomUUID())).digest('hex').slice(0, 12);
  const existing = await getOrder(id);
  if (existing) return existing;
  return saveOrder({
    id,
    orderNumber: `FI-${id.slice(0, 6).toUpperCase()}`,
    status: 'requested',
    source: 'phone',
    editToken: newToken(),
    createdAt: new Date().toISOString(),
    customer: {
      name: clean(request.caller_name, 100) || 'Phone caller',
      email: '',
      phone: clean(request.callback_number || caller, 30),
      addressLine1: '',
      addressLine2: '',
      city: clean(request.location, 80),
      state: '',
      postalCode: '',
    },
    notes: clean([request.reason, request.occasion, request.deadline && `Deadline: ${request.deadline}`, request.follow_up].filter(Boolean).join(' · '), 1000),
    ...items,
    adjustmentCents: 0,
  });
}

module.exports = {
  parseCallLines,
  LINK_DAYS, STRIPE_MIN_CENTS, EDIT_OPTIONS, json, clean, normalizeItems, normalizeCustomer, customerError, priceOrder, payUrl, editUrl, siteUrl,
  getOrder, getOrderByToken, getOrderByEditToken, listOrders, saveOrder, telegram, esc, dollars, stripe, markPaid, reconcile, closeCheckout,
  describeChanges, newToken, newId, saveCallRequest,
};
