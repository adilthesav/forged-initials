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

// CJ often returns productImage as a JSON array string — extract first URL
function extractImageUrl(raw) {
  if (!raw) return '';
  if (Array.isArray(raw)) return raw[0] || '';
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try { return JSON.parse(raw)[0] || ''; } catch { return raw; }
  }
  return raw;
}

function detectSearchType(input) {
  const t = input.trim();
  const urlMatch = t.match(/cjdropshipping\.com\/product\/.+-p-(\d+)\.html/i);
  if (urlMatch) return { type: 'pid', value: urlMatch[1] };
  if (/^CJ[A-Z0-9]{5,}$/i.test(t)) return { type: 'sku', value: t };
  if (/^\d{10,}$/.test(t)) return { type: 'pid', value: t };
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

    // ── Search ───────────────────────────────────────────────────────────────
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
        if (product) {
          // Normalize image on the way out too
          product.productImage = extractImageUrl(product.productImage);
        }
        return {
          statusCode: 200, headers: cors,
          body: JSON.stringify(product ? { list: [product], total: 1 } : { list: [], total: 0 }),
        };
      }

      // Normalize images in list results
      const list = (data.data?.list || []).map(p => ({
        ...p,
        productImage: extractImageUrl(p.productImage),
      }));

      return {
        statusCode: 200, headers: cors,
        body: JSON.stringify({ list, total: data.data?.total || 0 }),
      };
    }

    // ── Variants ─────────────────────────────────────────────────────────────
    if (action === 'variants') {
      const { pid } = body;
      const res = await fetch(`${CJ_BASE}/product/variant/query?pid=${pid}`, {
        headers: { 'CJ-Access-Token': cjToken },
      });
      const data = await res.json();
      const variants = (data.data || []).map(v => ({
        ...v,
        variantImage: extractImageUrl(v.variantImage),
      }));
      return { statusCode: 200, headers: cors, body: JSON.stringify(variants) };
    }

    // ── Import ───────────────────────────────────────────────────────────────
    if (action === 'import') {
      const { product } = body;
      const row = {
        name: product.name,
        description: product.description || '',
        price_cents: product.price_cents,
        image_url: extractImageUrl(product.image_url),  // ← key fix
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
