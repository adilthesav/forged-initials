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
  if (!data.data?.accessToken) throw new Error('CJ auth failed: ' + (data.message || JSON.stringify(data)));
  return data.data.accessToken;
}

function detectSearchType(input) {
  const t = input.trim();
  // CJ product page URL → extract PID
  const urlMatch = t.match(/cjdropshipping\.com\/product\/.+-p-(\d+)\.html/i);
  if (urlMatch) return { type: 'pid', value: urlMatch[1] };
  // SKU pattern: starts with CJ + alphanumeric
  if (/^CJ[A-Z0-9]{5,}$/i.test(t)) return { type: 'sku', value: t };
  // Pure numeric PID (10+ digits)
  if (/^\d{10,}$/.test(t)) return { type: 'pid', value: t };
  // Default: keyword
  return { type: 'keyword', value: t };
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  try {
    const cjToken = await getCJToken();
    const { action } = body;

    // ── Search (keyword / SKU / PID / URL) ──────────────────────────────────
    if (action === 'search') {
      const { keyword = '', page = 1 } = body;
      const detected = detectSearchType(keyword);
      let url;
      let singleProduct = false;

      if (detected.type === 'pid') {
        url = `${CJ_BASE}/product/query?pid=${detected.value}`;
        singleProduct = true;
      } else if (detected.type === 'sku') {
        url = `${CJ_BASE}/product/list?productSku=${encodeURIComponent(detected.value)}&pageNum=1&pageSize=20`;
      } else {
        url = `${CJ_BASE}/product/list?productNameEn=${encodeURIComponent(detected.value)}&pageNum=${page}&pageSize=20`;
      }

      const res = await fetch(url, { headers: { 'CJ-Access-Token': cjToken } });
      const data = await res.json();

      if (singleProduct) {
        const product = data.data;
        return {
          statusCode: 200,
          headers: cors,
          body: JSON.stringify(product
            ? { list: [product], total: 1, searchType: 'pid' }
            : { list: [], total: 0, searchType: 'pid' }
          ),
        };
      }

      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({
          ...(data.data || { list: [], total: 0 }),
          searchType: detected.type,
        }),
      };
    }

    // ── Get variants for a product ──────────────────────────────────────────
    if (action === 'variants') {
      const { pid } = body;
      const res = await fetch(`${CJ_BASE}/product/variant/query?pid=${pid}`, {
        headers: { 'CJ-Access-Token': cjToken },
      });
      const data = await res.json();
      return { statusCode: 200, headers: cors, body: JSON.stringify(data.data || []) };
    }

    // ── Import a variant into Supabase ──────────────────────────────────────
    if (action === 'import') {
      const { product } = body;
      const row = {
        name: product.name,
        description: product.description || '',
        price_cents: product.price_cents,
        image_url: product.image_url || '',
        category: product.category || 'other',
        quantity_remaining: 999,
        active: false,
        cj_pid: product.pid || '',
        cj_vid: product.vid || '',
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(row),
      });
      const data = await res.json();
      return { statusCode: 200, headers: cors, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    console.error('CJ API error:', err.message);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
