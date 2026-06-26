// FRESH PAYMENTS FUNCTION - New function to bypass caching issues
import Stripe from 'https://esm.sh/stripe@17?dts';

// Simple KV storage
const KV_URL = Deno.env.get('KV_URL') || 'https://api.upstash.com/v2/kv';

async function kvSet(key: string, value: any) {
  const token = Deno.env.get('KV_REST_API_TOKEN');
  if (!token) return;
  
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(value)
  });
}

// Stripe instance
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    stripeInstance = new Stripe(key, { apiVersion: '2024-12-18.acacia' });
  }
  return stripeInstance;
}

// Pricing
const SIZE_PRICES = { 'extra-small': 1, 'small': 2, 'medium': 3, 'large': 4, 'extra-large': 5 };
const BAIL_PRICES = { 'xs': 1.5, 's': 2.0, 'm': 2.5, 'l': 3.0 };
const PRONG_PRICES = { 'xs': 1.25, 's': 1.75, 'm': 2.25, 'l': 2.75 };
const ASSEMBLY_FEES = { 'connected': 15, 'bar': 25, 'separated': 0, 'none': 0 };
const JUMP_RING_PRICE = 0.5;
const SHIPPING_FEE = 10;

function calculatePrice(data: any) {
  const items = data.items || [];
  let lettersTotal = 0;
  
  for (const item of items) {
    const price = SIZE_PRICES[item.size as keyof typeof SIZE_PRICES] || 3;
    lettersTotal += price * item.quantity;
  }
  
  let hardwareTotal = 0;
  
  // Bails
  if (data.bailOptions) {
    for (const bail of data.bailOptions) {
      const price = bail.price || BAIL_PRICES[bail.size as keyof typeof BAIL_PRICES] || 0;
      hardwareTotal += price * bail.quantity;
    }
  }
  
  // Prongs
  if (data.prongsOptions) {
    for (const prong of data.prongsOptions) {
      const price = prong.price || PRONG_PRICES[prong.size as keyof typeof PRONG_PRICES] || 0;
      hardwareTotal += price * prong.quantity;
    }
  }
  
  // Jump rings
  if (data.extraJumpRings) {
    hardwareTotal += JUMP_RING_PRICE * data.extraJumpRings;
  }
  
  const assemblyFee = ASSEMBLY_FEES[data.pendantStyle as keyof typeof ASSEMBLY_FEES] || 0;
  const subtotal = lettersTotal + hardwareTotal + assemblyFee;
  const total = subtotal + SHIPPING_FEE;
  
  return { lettersTotal, hardwareTotal, assemblyFee, shipping: SHIPPING_FEE, subtotal, total };
}

// Main handler
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  
  console.log(`📥 ${method} ${path}`);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Health check
    if (path.includes('health')) {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          version: 'payments-v3.0-BAILS-PRONGS-FIXED-2024', 
          deployed: 'NOW',
          timestamp: new Date().toISOString() 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Debug endpoint
    if (path.includes('debug-env')) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL');
      
      return new Response(
        JSON.stringify({
          stripe: {
            configured: !!stripeKey,
            keyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : null,
            isLive: stripeKey?.startsWith('sk_live_'),
            isTest: stripeKey?.startsWith('sk_test_'),
          },
          discord: {
            configured: !!discordWebhook,
          },
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create payment intent
    if (path.includes('create-payment-intent') && method === 'POST') {
      const body = await req.json();
      const pricing = calculatePrice(body);
      const orderId = `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(pricing.total * 100),
        currency: 'usd',
        metadata: {
          orderId,
          customerName: body.customerName,
          email: body.email,
        },
      });
      
      // Store order
      await kvSet(`order:${orderId}`, {
        id: orderId,
        ...body,
        amount: pricing.total,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        createdAt: new Date().toISOString(),
      });
      
      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret, orderId, amount: pricing.total }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get price
    if (path.includes('get-price') && method === 'POST') {
      const body = await req.json();
      const pricing = calculatePrice(body);
      
      return new Response(
        JSON.stringify({ ...pricing, currency: 'usd' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Discord test
    if (path.includes('discord') && path.includes('test') && method === 'POST') {
      const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
      
      if (!webhookUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'Discord webhook not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🧪 TEST NOTIFICATION',
            color: 0xFFA500,
            fields: [
              { name: 'Status', value: '✅ Working!', inline: false },
              { name: 'Timestamp', value: new Date().toISOString(), inline: false }
            ]
          }]
        })
      });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Test sent!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Cash App payment
    if (path.includes('notify-cashapp') && method === 'POST') {
      const body = await req.json();
      
      console.log('💰 CASH APP DATA RECEIVED:', JSON.stringify(body, null, 2));
      console.log('📦 bailOptions:', body.bailOptions);
      console.log('📦 prongsOptions:', body.prongsOptions);
      console.log('📦 extraJumpRings:', body.extraJumpRings);
      
      const orderId = `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      await kvSet(`order:${orderId}`, {
        id: orderId,
        ...body,
        status: 'pending',
        paymentMethod: 'cashapp',
        createdAt: new Date().toISOString(),
      });
      
      // Discord notification
      const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
      if (webhookUrl) {
        // Build complete items list with clear formatting
        const itemsList: string[] = [];
        
        // Add letters
        if (body.items && Array.isArray(body.items) && body.items.length > 0) {
          itemsList.push('**LETTERS:**');
          body.items.forEach((item: any) => {
            itemsList.push(`  • ${item.letter} - Qty: ${item.quantity} - Size: ${item.size}`);
          });
        }
        
        // Add bails
        if (body.bailOptions && Array.isArray(body.bailOptions) && body.bailOptions.length > 0) {
          itemsList.push('**BAILS:**');
          body.bailOptions.forEach((bail: any) => {
            itemsList.push(`  • Size ${bail.size.toUpperCase()} - Qty: ${bail.quantity} - $${bail.price.toFixed(2)} each`);
          });
        }
        
        // Add prongs
        if (body.prongsOptions && Array.isArray(body.prongsOptions) && body.prongsOptions.length > 0) {
          itemsList.push('**PRONGS:**');
          body.prongsOptions.forEach((prong: any) => {
            itemsList.push(`  • Size ${prong.size.toUpperCase()} - Qty: ${prong.quantity} - $${prong.price.toFixed(2)} each`);
          });
        }
        
        // Add jump rings
        if (body.extraJumpRings && body.extraJumpRings > 0) {
          itemsList.push('**JUMP RINGS:**');
          itemsList.push(`  • Qty: ${body.extraJumpRings}`);
        }
        
        const itemsText = itemsList.length > 0 ? itemsList.join('\n') : 'No items';
        
        console.log('📨 Sending Discord notification with items:', itemsText);
        
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `🎉 NEW CASH APP ORDER`,
              description: `Order ID: **${orderId}**`,
              color: 0x00D632,
              fields: [
                { name: '👤 Customer', value: body.customerName || 'N/A', inline: true },
                { name: '📧 Email', value: body.email || 'N/A', inline: true },
                { name: '💰 Total', value: `$${body.amount}`, inline: true },
                { name: '📦 Order Details', value: itemsText, inline: false },
                { name: '📍 Shipping', value: `${body.city || 'N/A'}, ${body.stateOrProvinceCode || 'N/A'}`, inline: true },
                { name: '💳 Payment Method', value: 'Cash App', inline: true }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        });
        
        console.log('✅ Discord notification sent successfully');
      }
      
      return new Response(
        JSON.stringify({ success: true, orderId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Not found', path }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});