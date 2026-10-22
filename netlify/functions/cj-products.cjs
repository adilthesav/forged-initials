const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const ADMIN_TOKEN = 'forgedadmin2026';

function extractImageUrl(raw) {
  if (!raw) return '';
  const s = typeof raw === 'string' ? raw.trim() : String(raw);
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr[0]) return String(arr[0]).trim();
    } catch {}
  }
  return s;
}

function detectSearchType(input) {
  const t = input.trim();
  // CJ product URL → extract numeric-only pid (internal ID, works with /product/query)
  const urlMatch = t.match(/cjdropshipping\.com\/product\/.+-p-(\d+)\.html/i);
  if (urlMatch) return { type: 'pid', value: urlMatch[1] };
  // ANY CJ alphanumeric code (CJLX1683903, CJLX168390313MN, etc.) → keyword search
  // CJ's /product/query endpoint ONLY accepts numeric internal PIDs — CJLX format always fails it
  if (/^CJ[A-Za-z0-9]{5,}$/i.test(t)) return { type: 'sku', value: t };
  // Long numeric internal ID → direct /product/query
  if (/^\d{10,}$/.test(t)) return { type: 'pid', value: t };
  return { type: 'keyword', value: t };
}

async function getCJToken() {
  const res = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.CJ_EMAIL, password: process.env.CJ_API_KEY }),
  });
  const data = await res.json();
  if (!data.data?.accessToken) throw new Error('CJ auth failed: ' + (data.message || JSON.stringify(data)));
  return data.data.accessToken;
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,x-admin-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  if (event.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    // ── QUERY (direct product lookup by numeric internal PID only) ────────────
    if (action === 'query') {
      const { pid } = body;
      if (!pid) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'pid required' }) };
      const { type, value } = detectSearchType(pid);
      const pidToQuery = type === 'pid' ? value : pid;
      const token = await getCJToken();
      const res = await fetch(
        `https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${encodeURIComponent(pidToQuery)}`,
        { headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      console.log('CJ query response:', JSON.stringify(data).slice(0, 400));
      const p = data.data;
      if (!p || (!p.pid && !p.productId)) {
        return { statusCode: 200, headers: cors, body: JSON.stringify({ found: false, message: data.message || 'Not found' }) };
      }
      return {
        statusCode: 200, headers: cors,
        body: JSON.stringify({
          found: true,
          pid: p.pid || p.productId || '',
          productNameEn: p.productNameEn || p.productName || '',
          productImage: extractImageUrl(p.productImage || ''),
          sellPrice: p.sellPrice || '0',
        }),
      };
    }

    // ── SEARCH ────────────────────────────────────────────────────────────────
    if (action === 'search') {
      const { keyword = '', page = 1 } = body;
      const token = await getCJToken();
      const { type, value } = detectSearchType(keyword);

      const cjHeaders = { 'CJ-Access-Token': token, 'Content-Type': 'application/json' };

      const normalizeProduct = (p) => ({
        pid: p.pid || p.productId || '',
        productNameEn: p.productNameEn || p.productName || '',
        productImage: extractImageUrl(p.productImage),
        sellPrice: p.sellPrice || '0',
        categoryName: p.categoryName || '',
      });

      if (type === 'pid') {
        const res = await fetch(
          `https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${encodeURIComponent(value)}`,
          { headers: cjHeaders }
        );
        const data = await res.json();
        console.log('CJ pid query response:', JSON.stringify(data).slice(0, 400));
        const p = data.data;
        if (!p || (!p.pid && !p.productId)) {
          return { statusCode: 200, headers: cors, body: JSON.stringify({ list: [], total: 0, _debug: data.message || 'no result' }) };
        }
        return {
          statusCode: 200, headers: cors,
          body: JSON.stringify({ list: [normalizeProduct(p)], total: 1 }),
        };
      }

      // SKU (CJLX...) and keyword both use the list endpoint
      const listUrl = `https://developers.cjdropshipping.com/api2.0/v1/product/list?keyword=${encodeURIComponent(value)}&pageNum=${page}&pageSize=20`;
      const res = await fetch(listUrl, { headers: cjHeaders });
      const data = await res.json();
      console.log('CJ list response code:', data.code, 'total:', data.data?.total);

      const list = (data.data?.list || []).map(normalizeProduct);
      return { statusCode: 200, headers: cors, body: JSON.stringify({ list, total: data.data?.total || 0 }) };
    }

    // ── VARIANTS ──────────────────────────────────────────────────────────────
    if (action === 'variants') {
      const { pid } = body;
      const token = await getCJToken();
      const res = await fetch(
        `https://developers.cjdropshipping.com/api2.0/v1/product/variant/query?pid=${encodeURIComponent(pid)}`,
        { headers: { 'CJ-Access-Token': token, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      console.log('CJ variants response code:', data.code, 'data type:', typeof data.data, 'is array:', Array.isArray(data.data));
      const raw = data.data?.variants || data.data?.list || data.data || [];
      const variants = (Array.isArray(raw) ? raw : []).map(v => ({
        vid: v.vid || v.variantId || '',
        variantNameEn: v.variantNameEn || v.variantName || '',
        variantSellPrice: v.variantSellPrice || v.sellPrice || '0',
        variantImage: extractImageUrl(v.variantImage || v.variantImageUrl || ''),
        warehouseCountryCode: v.warehouseCountryCode || v.warehouseCountry || 'CN',
      }));
      return { statusCode: 200, headers: cors, body: JSON.stringify(variants) };
    }

    // ── IMPORT ────────────────────────────────────────────────────────────────
    if (action === 'import') {
      const { product } = body;
      const variants = Array.isArray(product.variants) ? product.variants : [];

      const row = {
        name: product.name,
        description: product.description || '',
        price_cents: parseInt(product.price_cents) || 0,
        image_url: extractImageUrl(product.image_url),
        category: product.category || 'other',
        quantity_remaining: 999,
        active: false,
        cj_pid: product.pid || '',
        cj_vid: '',
        variants,
      };

      const headers = {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(row),
      });
      const saved = await res.json();
      if (res.status >= 400) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Supabase error', detail: saved }) };
      }
      return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true, product: saved }) };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown action: ' + action }) };
  } catch (err) {
    console.error('cj-products error:', err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
