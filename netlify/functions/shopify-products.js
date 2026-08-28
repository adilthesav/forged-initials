const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'forged-initials-storefront.myshopify.com';
const API_VERSION = '2026-07';

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'SHOPIFY_ACCESS_TOKEN not configured' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const limit = parseInt(params.limit) || 50;
    const page_info = params.page_info || '';

    let url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/products.json?limit=${limit}&status=active`;
    if (page_info) url += `&page_info=${page_info}`;

    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ error: err }) };
    }

    const data = await res.json();

    const products = (data.products || []).map(p => ({
      id: String(p.id),
      name: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, '') || '',
      image_url: p.images?.[0]?.src || '',
      price_cents: p.variants?.[0]?.price
        ? Math.round(parseFloat(p.variants[0].price) * 100)
        : 0,
      category: p.product_type?.toLowerCase() || 'other',
      active: p.status === 'active',
      source: 'shopify',
      shopify_id: String(p.id),
      variants: (p.variants || []).map(v => ({
        vid: String(v.id),
        name: v.title,
        price_cents: Math.round(parseFloat(v.price || '0') * 100),
        inventory_quantity: v.inventory_quantity || 0,
        sku: v.sku || '',
      })),
      tags: p.tags || '',
    }));

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ products, total: products.length }),
    };
  } catch (err) {
    console.error('shopify-products error:', err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
