const ADMIN_TOKEN = 'forgedadmin2026';
const CJ_BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';

async function getCJToken() {
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_EMAIL, password: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  if (!data.data?.accessToken) throw new Error('CJ auth failed: ' + JSON.stringify(data));
  return data.data.accessToken;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const adminToken = event.headers['x-admin-token'];
  if (adminToken !== ADMIN_TOKEN) return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  try {
    const cjToken = await getCJToken();
    const headers = { 'CJ-Access-Token': cjToken, 'Content-Type': 'application/json' };

    // ── Search CJ product catalog ────────────────────────────────────────────
    if (body.action === 'search') {
      const { keyword = '', page = 1 } = body;
      const url = `${CJ_BASE}/product/list?productNameEn=${encodeURIComponent(keyword)}&pageNum=${page}&pageSize=20`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      return { statusCode: 200, headers: cors, body: JSON.stringify(data.data || { list: [], total: 0 }) };
    }

    // ── Import a CJ product into Supabase ────────────────────────────────────
    if (body.action === 'import') {
      const { product } = body;

      // Fetch first available variant vid from CJ
      let vid = '';
      try {
        const detailRes = await fetch(`${CJ_BASE}/product/query?pid=${product.pid}`, { headers });
        const detail = await detailRes.json();
        const variants = detail.data?.variants || [];
        if (variants.length > 0) vid = variants[0].vid;
      } catch (e) {
        console.warn('Could not fetch CJ variants:', e.message);
      }

      const supabaseHeaders = {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      const newProduct = {
        name: product.name,
        description: product.description || `Dropshipped via CJ · CJ cost: $${(product.cj_price_cents / 100).toFixed(2)}`,
        price_cents: product.price_cents,
        image_url: product.image_url || '',
        category: product.category || 'other',
        quantity_remaining: 999,
        active: false,
        cj_pid: product.pid,
        cj_vid: vid,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      return { statusCode: 200, headers: cors, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    console.error('CJ error:', err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
