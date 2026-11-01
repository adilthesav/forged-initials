const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

// Promoted products sell elsewhere, so they only need a link and never carry a price or stock
function checkProduct(body) {
  if (body.product_type !== undefined && !['crafted', 'selected', 'promoted'].includes(body.product_type)) {
    return 'Unknown product type';
  }
  if (body.product_type !== 'promoted') return null;
  try {
    if (new URL(body.affiliate_url).protocol !== 'https:') return 'The product link must start with https://';
  } catch {
    return 'Add a valid product link';
  }
  body.price_cents = 0;
  body.quantity_remaining = 0;
  body.variants = [];
  return null;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const token = event.headers['x-admin-token'];
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Not configured' }) };
  if (token !== adminToken) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === 'POST' || method === 'PATCH') {
    const problem = checkProduct(body);
    if (problem) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: problem }) };
  }

  try {
    if (method === 'GET') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=created_at.desc`, { headers });
      return { statusCode: 200, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (method === 'POST') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
      return { statusCode: res.ok ? 201 : res.status, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (method === 'PATCH') {
      const { id, ...updates } = body;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH', headers, body: JSON.stringify(updates),
      });
      return { statusCode: res.status, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (method === 'DELETE') {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${body.id}`, { method: 'DELETE', headers });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ deleted: true }) };
    }
    return { statusCode: 405, headers: cors, body: 'Method not allowed' };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
