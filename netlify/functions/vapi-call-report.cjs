// Receives Vapi's end-of-call report and sends the owner a Telegram summary of
// what the caller wants, with the full transcript attached as a text file.
const crypto = require('crypto');

const OUTPUT_NAME = 'order_request';
const TELEGRAM_LIMIT = 4000; // Telegram rejects messages over 4096 characters

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, 'Method not allowed');

  // Fail closed: without a secret anyone could post fake calls to Telegram
  const SECRET = process.env.VAPI_WEBHOOK_SECRET;
  if (!SECRET) {
    console.error('⚠️ VAPI_WEBHOOK_SECRET is not set');
    return reply(500, 'Not configured');
  }
  if (!isAuthorized(event.headers || {}, SECRET)) {
    console.error('⚠️ Rejected a call report with the wrong secret');
    return reply(401, 'Unauthorized');
  }

  let message;
  try {
    message = JSON.parse(event.body || '{}').message;
  } catch {
    return reply(400, 'Invalid JSON');
  }

  // Vapi also sends other event types here; only the final report matters
  if (message?.type !== 'end-of-call-report') return reply(200, 'Ignored');
  console.log(`📞 Call report received: ${message.endedReason || 'unknown ending'}`);

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('⚠️ Telegram is not configured');
    return reply(500, 'Not configured');
  }

  try {
    await sendTelegram(BOT_TOKEN, 'sendMessage', {
      json: { chat_id: CHAT_ID, text: formatSummary(message), parse_mode: 'HTML', disable_web_page_preview: true },
    });
  } catch (err) {
    console.error('⚠️ Telegram error:', err.message);
    return reply(502, 'Telegram failed');
  }

  const transcript = message.artifact?.transcript || message.transcript;
  if (transcript) {
    try {
      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('document', new Blob([transcript], { type: 'text/plain' }), `call-${callId(message) || 'transcript'}.txt`);
      await sendTelegram(BOT_TOKEN, 'sendDocument', { form });
    } catch (err) {
      // The summary already went through, so don't fail the whole report
      console.error('⚠️ Transcript upload failed:', err.message);
    }
  }

  return reply(200, 'Sent');
};

function reply(statusCode, message) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) };
}

function isAuthorized(headers, secret) {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const given = (lower.authorization || '').replace(/^Bearer\s+/i, '') || lower['x-vapi-secret'] || '';
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

function callId(message) {
  return message.call?.id;
}

// Structured outputs arrive keyed by id, each as { name, result }
function orderRequest(message) {
  const outputs = message.artifact?.structuredOutputs || {};
  const match = Object.values(outputs).find((o) => o?.name === OUTPUT_NAME);
  // A field set up as true/false instead of an object has no details to show
  return match?.result && typeof match.result === 'object' ? match.result : null;
}

function formatItems(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .map((i) => `  • ${esc(i.letter || i.item || '?')}${i.size ? `, ${esc(i.size)}` : ''}${i.quantity ? ` ×${esc(i.quantity)}` : ''}`)
    .join('\n');
}

function formatSummary(message) {
  const order = orderRequest(message);
  const caller = message.call?.customer?.number || message.customer?.number;
  const seconds = Number(message.durationSeconds);
  const summary = message.analysis?.summary || message.summary;

  const lines = ['📞 <b>NEW PHONE CALL</b>'];
  if (caller) lines.push(`☎️ <b>Caller ID:</b> ${esc(caller)}`);
  if (seconds > 0) lines.push(`⏱ <b>Length:</b> ${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`);
  lines.push('');

  if (order) {
    if (order.caller_name) lines.push(`👤 <b>Name:</b> ${esc(order.caller_name)}`);
    if (order.callback_number) lines.push(`📱 <b>Call back:</b> ${esc(order.callback_number)}${order.contact_preference ? ` (${esc(order.contact_preference)})` : ''}`);
    if (order.reason) lines.push(`🎯 <b>Reason:</b> ${esc(order.reason)}`);
    const letters = formatItems(order.letters);
    if (letters) lines.push(`💎 <b>Letters:</b>\n${letters}`);
    const parts = formatItems(order.parts);
    if (parts) lines.push(`🔩 <b>Parts:</b>\n${parts}`);
    if (order.occasion) lines.push(`🎁 <b>For:</b> ${esc(order.occasion)}`);
    if (order.deadline) lines.push(`🗓 <b>Deadline:</b> ${esc(order.deadline)}`);
    if (order.location) lines.push(`📍 <b>Location:</b> ${esc(order.location)}`);
    if (order.follow_up) lines.push(`⚠️ <b>Follow up:</b> ${esc(order.follow_up)}`);
  } else {
    lines.push('⚠️ <i>No order details were extracted. Check the summary and transcript.</i>');
  }

  if (summary) lines.push('', `📝 <b>Summary:</b> ${esc(summary)}`);
  if (callId(message)) lines.push('', `🎧 <a href="https://dashboard.vapi.ai/calls/${encodeURIComponent(callId(message))}">Recording and details in Vapi</a>`);

  const text = lines.join('\n');
  if (text.length <= TELEGRAM_LIMIT) return text;
  // Long free text can't be cut safely inside HTML tags, so drop to the summary-free version
  return lines.filter((l) => !l.startsWith('📝')).join('\n').slice(0, TELEGRAM_LIMIT);
}

async function sendTelegram(token, method, { json, form }) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    ...(json ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json) } : { body: form }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).description || `HTTP ${r.status}`);
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
