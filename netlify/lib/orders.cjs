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

async function getOrderByToken(token) {
  if (!/^[A-Za-z0-9_-]{22}$/.test(String(token))) return null;
  const rows = await kvRows(`key=like.${PREFIX}*&value->>payToken=eq.${token}&select=value`);
  return rows[0]?.value || null;
}

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
  });
  await telegram(
    `💰 <b>ORDER PAID: ${esc(order.orderNumber)}</b>\n\n` +
    `👤 ${esc(order.customer.name)}\n💵 ${dollars(session.amount_total || 0)}\n\n` +
    `Next: make the piece and create the shipping label by hand.`
  );
  return paid;
}

// Checks the order's Stripe session, so a payment is noticed even if a webhook is missed.
async function reconcile(order) {
  if (!order.stripeSessionId || order.status === 'paid') return { order, session: null };
  const session = await stripe(`checkout/sessions/${encodeURIComponent(order.stripeSessionId)}`);
  if (session.payment_status === 'paid') return { order: await markPaid(order, session), session };
  return { order, session };
}

function newToken() {
  return crypto.randomBytes(16).toString('base64url');
}

function newId() {
  return crypto.randomBytes(6).toString('hex');
}

module.exports = {
  LINK_DAYS, STRIPE_MIN_CENTS, json, clean, normalizeItems, priceOrder, payUrl, siteUrl, getOrder, getOrderByToken,
  listOrders, saveOrder, telegram, esc, dollars, stripe, markPaid, reconcile, newToken, newId,
};
