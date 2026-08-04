exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
  const N8N_WEBHOOK = process.env.N8N_CONTACT_WEBHOOK;

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

  // ── Forward to n8n → Outlook ─────────────────────────────────────────────
  if (N8N_WEBHOOK) {
    try {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone: phone || '', subject, message, attachmentCount: attachments.length, receivedAt: new Date().toISOString() }),
      });
      console.log('✅ Sent to n8n/Outlook');
    } catch (err) {
      console.error('⚠️ n8n webhook error:', err.message);
    }
  }

  // ── Send to Telegram ─────────────────────────────────────────────────────
  if (BOT_TOKEN && CHAT_ID) {
    let text = `💬 <b>NEW CONTACT MESSAGE</b>\n\n`;
    text += `👤 <b>Name:</b> ${esc(firstName)} ${esc(lastName)}\n`;
    text += `📧 <b>Email:</b> ${esc(email)}\n`;
    if (phone) text += `📱 <b>Phone:</b> ${esc(phone)}\n`;
    text += `\n📋 <b>Subject:</b> ${esc(subject)}\n\n`;
    text += `💭 <b>Message:</b>\n${esc(message)}`;
    if (attachments.length > 0) text += `\n\n📎 <b>${attachments.length} file(s) attached below</b>`;

    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
      });
      if (!r.ok) { const j = await r.json(); throw new Error(j.description); }
      console.log('✅ Telegram sent');
    } catch (err) {
      console.error('⚠️ Telegram error:', err.message);
    }

    for (const file of attachments) {
      try {
        const buffer    = Buffer.from(file.data, 'base64');
        const { Blob }  = require('buffer');
        const blob      = new Blob([buffer], { type: file.type });
        const isImage   = file.type.startsWith('image/');
        const endpoint  = isImage ? 'sendPhoto' : 'sendDocument';
        const fieldName = isImage ? 'photo' : 'document';
        const form      = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append(fieldName, blob, file.name);
        form.append('caption', `📎 ${file.name}\nFrom: ${firstName} ${lastName} (${email})`);
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { method: 'POST', body: form });
        console.log(`✅ Sent file: ${file.name}`);
      } catch (err) {
        console.error(`⚠️ File "${file.name}" failed:`, err.message);
      }
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
