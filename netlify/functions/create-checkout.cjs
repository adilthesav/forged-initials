const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const SITE_URL = 'https://forged-initials.com';

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

function isValidUrl(s) {
  try { return /^https?:\/\/.+/.test(new URL(s).href); } catch { return false; }
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  try {
    const { productId, productName, priceInCents, imageUrl, quantity = 1, selectedVid = '' } = JSON.parse(event.body);

    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${productId}&select=quantity_remaining,active,price_cents,variants,image_url,name`,
      { headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
    );
    const [product] = await checkRes.json();

    if (!product || !product.active) {
      return { statusCode: 404, headers: cors, body: JSON.stringify({ error: 'Product not found' }) };
    }
    if (product.quantity_remaining < quantity) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Out of stock' }) };
    }

    // Always derive price server-side — never trust the client-supplied priceInCents
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const matchedVariant = selectedVid ? variants.find(v => v.vid === selectedVid) : null;
    const trustedPrice = (matchedVariant?.price_cents ?? product.price_cents) || product.price_cents;

    // Validate selectedVid actually belongs to this product
    if (selectedVid && !matchedVariant) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid variant selected' }) };
    }

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('line_items[0][quantity]', String(quantity));
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(trustedPrice));
    params.append('line_items[0][price_data][product_data][name]', product.name || productName);

    const cleanImage = extractImageUrl(imageUrl);
    if (cleanImage && isValidUrl(cleanImage)) {
      params.append('line_items[0][price_data][product_data][images][0]', cleanImage);
    }

    params.append('success_url', `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${SITE_URL}/shop`);
    params.append('metadata[productId]', productId);
    params.append('metadata[quantity]', String(quantity));
    params.append('metadata[selectedVid]', selectedVid);
    params.append('shipping_address_collection[allowed_countries][0]', 'US');
    params.append('phone_number_collection[enabled]', 'true');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();
    if (session.error) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: session.error.message }) };
    }

    return { statusCode: 200, headers: cors, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Checkout error:', err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
