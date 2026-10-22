const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  const token = event.headers['x-admin-token'];
  const adminToken = process.env.ADMIN_TOKEN || 'forgedadmin2026';
  if (token !== adminToken) return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };

  try {
    const { filename, contentType, base64 } = JSON.parse(event.body);
    const buffer = Buffer.from(base64, 'base64');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const path = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: err }) };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
    return { statusCode: 200, headers: cors, body: JSON.stringify({ url: publicUrl }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
