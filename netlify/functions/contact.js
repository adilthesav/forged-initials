// Netlify Function: contact form handler with Telegram file forwarding
// Auto-deploys with every git push — no separate deployment needed

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Server config error' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) };
  }

  const { firstName, lastName, email, phone, subject, message, attachments = [] } = body;

  if (!firstName || !lastName || !email || !subject || !message) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ success: false, message: 'Missing required fields' }) };
  }

  // ── Build and send text message ──────────────────────────────────────────
  let text = `💬 <b>NEW CONTACT MESSAGE</b>\n\n`;
  text += `👤 <b>Name:</b> ${esc(firstName)} ${esc(lastName)}\n`;
  text += `📧 <b>Email:</b> ${esc(email)}\n`;
  if (phone) text += `📱 <b>Phone:</b> ${esc(phone)}\n`;
  text += `\n📋 <b>Subject:</b> ${esc(subject)}\n\n`;
  text += `💭 <b>Message:</b>\n${esc(message)}`;
  if (attachments.length > 0) {
    text += `\n\n📎 <b>${attachments.length} file${attachments.length > 1 ? 's' : ''} attached below</b>`;
  }

  try {
    const textRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
    const textJson = await textRes.json();
    if (!textRes.ok) throw new Error(`Telegram sendMessage failed: ${textJson.description}`);
    console.log('✅ Text message sent');
  } catch (err) {
    console.error('❌ Failed to send text:', err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, message: 'Failed to send message to Telegram' }) };
  }

  // ── Send each attachment ─────────────────────────────────────────────────
  for (const file of attachments) {
    try {
      const buffer     = Buffer.from(file.data, 'base64');
      const { Blob }   = require('buffer');
      const blob       = new Blob([buffer], { type: file.type });
      const isImage    = file.type.startsWith('image/');
      const endpoint   = isImage ? 'sendPhoto' : 'sendDocument';
      const fieldName  = isImage ? 'photo' : 'document';
      const caption    = `📎 ${file.name}\nFrom: ${firstName} ${lastName} (${email})`;

      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append(fieldName, blob, file.name);
      form.append('caption', caption);

      const fileRes  = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
        method: 'POST',
        body: form,
      });
      const fileJson = await fileRes.json();
      if (!fileRes.ok) throw new Error(fileJson.description || 'Unknown error');
      console.log(`✅ Sent ${fieldName}: ${file.name}`);
    } catch (err) {
      console.error(`⚠️ Failed to send file "${file.name}":`, err.message);
      // Don't fail the whole request for a single file error
    }
  }

  return {
    statusCode: 200,
    headers: cors,
    body: JSON.stringify({ success: true, message: "Message sent! We'll get back to you soon." }),
  };
};

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
