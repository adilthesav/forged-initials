const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const token = event.headers['x-admin-token'];
  if (token !== (process.env.ADMIN_TOKEN || 'forgedadmin2026')) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = {
    'apikey': key, 'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json', 'Prefer': 'return=representation',
  };
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (event.httpMethod === 'GET') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?order=created_at.desc`, { headers });
      return { statusCode: 200, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (event.httpMethod === 'POST') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, { method: 'POST', headers, body: JSON.stringify(body) });
      return { statusCode: 201, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (event.httpMethod === 'PATCH') {
      const { id, ...updates } = body;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify(updates) });
      return { statusCode: 200, headers: cors, body: JSON.stringify(await res.json()) };
    }
    if (event.httpMethod === 'DELETE') {
      await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${body.id}`, { method: 'DELETE', headers });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ deleted: true }) };
    }
    return { statusCode: 405, headers: cors, body: 'Method not allowed' };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
