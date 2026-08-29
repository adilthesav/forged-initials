const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const token = event.headers['x-admin-token'];
  const adminToken = process.env.ADMIN_TOKEN || 'forgedadmin2026';
  if (token !== adminToken) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sbHeaders = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (method === 'GET') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?order=created_at.desc&select=*`,
        { headers: sbHeaders }
      );
      const data = await res.json();
      if (!res.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data }) };
      return { statusCode: 200, headers: cors, body: JSON.stringify(data) };
    }

    if (method === 'POST') {
      const { action, ...payload } = body;

      if (action === 'create') {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data }) };
        return { statusCode: 200, headers: cors, body: JSON.stringify(Array.isArray(data) ? data[0] : data) };
      }

      if (action === 'update') {
        const { id, ...fields } = payload;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${id}`, {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify(fields),
        });
        const data = await res.json();
        if (!res.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data }) };
        return { statusCode: 200, headers: cors, body: JSON.stringify(Array.isArray(data) ? data[0] : data) };
      }

      if (action === 'delete') {
        const { id } = payload;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${id}`, {
          method: 'DELETE',
          headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data }) };
        }
        return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
      }

      if (action === 'toggle_published') {
        const { id, published } = payload;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${id}`, {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify({ published }),
        });
        const data = await res.json();
        if (!res.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data }) };
        return { statusCode: 200, headers: cors, body: JSON.stringify(Array.isArray(data) ? data[0] : data) };
      }

      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
};
