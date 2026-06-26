// Forged Initials - Complete Server v8 - Telegram Notifications
// All payment webhooks, order management, and Telegram notifications

import { sendTelegramNotification, notifyCashAppPayment, sendContactFormToTelegram } from './notifications.ts';
import { handleStripeWebhook, createPaymentIntent, createCheckoutSession } from './payments.ts';
import { createFedExShipment, estimatePackageWeight, getShipmentDetails } from './shipping.ts';
import * as kv from './kv_store.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature, x-requested-with, accept, origin, cache-control, pragma, x-admin-password',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  console.log('🚀 REQUEST:', req.method, path);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }
  
  try {
    // ============= HEALTH CHECK =============
    if (path.includes('health')) {
      console.log('✅ HEALTH CHECK');
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          version: 'v8-complete-telegram',
          timestamp: new Date().toISOString(),
          message: 'Server running with Telegram notifications',
          endpoints: ['/health', '/stripe-webhook', '/create-payment-intent', '/create-checkout-session', '/cashapp-payment', '/create-shipment', '/orders', '/orders/:id (DELETE)']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= GET ALL ORDERS (ADMIN) =============
    if (path.includes('/orders') && req.method === 'GET') {
      console.log('📋 GET ALL ORDERS - Version 4.0 (Password Protected)');
      
      // Check admin password
      const adminPassword = req.headers.get('X-Admin-Password');
      const correctPassword = Deno.env.get('ADMIN_PASSWORD') || 'forgedadmin2026'; // Default fallback
      
      if (!adminPassword) {
        console.log('❌ No admin password provided');
        return new Response(
          JSON.stringify({ success: false, error: 'Admin password required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      if (adminPassword !== correctPassword) {
        console.log('❌ Invalid admin password');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid admin password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log('✅ Admin authenticated successfully');
      
      try {
        // Get all data with keys starting with "order:"
        const allData = await kv.getByPrefix('order:');
        
        console.log('📦 Raw data from KV:', allData.length, 'items');
        
        // BUILD A COMPLETELY NEW CLEAN ARRAY
        const cleanOrders: any[] = [];
        
        for (let i = 0; i < allData.length; i++) {
          const item = allData[i];
          
          // Skip if not an object
          if (typeof item !== 'object' || item === null || Array.isArray(item)) {
            console.log(`❌ [${i}] Skipping non-object:`, typeof item, Array.isArray(item) ? 'array' : '');
            continue;
          }
          
          // Skip if missing required fields
          if (!item.orderId && !item.id) {
            console.log(`❌ [${i}] Skipping - no ID:`, Object.keys(item).slice(0, 5));
            continue;
          }
          
          if (!item.customerName && !item.email) {
            console.log(`❌ [${i}] Skipping - no customer:`, Object.keys(item).slice(0, 5));
            continue;
          }
          
          // Valid order - normalize and add
          const normalizedOrder: any = {
            ...item,
            orderId: item.orderId || item.id
          };
          
          // Normalize old format to new format
          if (item.letters && !item.items) {
            normalizedOrder.items = [{
              letter: item.letters,
              size: item.size || 'medium',
              price: item.amount || 0,
              quantity: item.quantity || 1
            }];
          } else if (!item.items) {
            normalizedOrder.items = [];
          }
          
          cleanOrders.push(normalizedOrder);
          console.log(`✅ [${i}] Added order:`, normalizedOrder.orderId);
        }
        
        console.log('✅ Clean orders built:', cleanOrders.length);
        
        // Get shipment data for each order
        const ordersWithShipments = [];
        for (const order of cleanOrders) {
          try {
            const shipment = await kv.get(`shipment:${order.orderId}`);
            ordersWithShipments.push({
              ...order,
              shipment: shipment || null
            });
          } catch (e) {
            ordersWithShipments.push(order);
          }
        }
        
        // Sort by creation date, oldest first
        ordersWithShipments.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB; // Oldest first
        });
        
        // FINAL VALIDATION - make sure no strings slipped through
        const finalValidOrders = ordersWithShipments.filter((order: any) => {
          const isValid = typeof order === 'object' && order !== null && order.orderId;
          if (!isValid) {
            console.log('❌ CRITICAL: Invalid order in final array!', typeof order);
          }
          return isValid;
        });
        
        console.log('✅ Final validation:', finalValidOrders.length, 'orders');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            orders: finalValidOrders,
            count: finalValidOrders.length,
            debug: {
              version: '3.0-explicit',
              totalItemsInKV: allData.length,
              cleanOrdersBuilt: cleanOrders.length,
              finalOrders: finalValidOrders.length,
              timestamp: new Date().toISOString()
            }
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }, 
            status: 200 
          }
        );
      } catch (error) {
        console.error('❌ Failed to fetch orders:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            errorStack: error.stack,
            orders: [],
            count: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= DELETE ORDER (ADMIN) =============
    if (path.includes('/orders/') && req.method === 'DELETE') {
      console.log('🗑️ DELETE ORDER');
      
      // Check admin password
      const adminPassword = req.headers.get('X-Admin-Password');
      const correctPassword = Deno.env.get('ADMIN_PASSWORD') || 'forgedadmin2026';
      
      if (!adminPassword || adminPassword !== correctPassword) {
        console.log('❌ Unauthorized delete attempt');
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // Extract order ID from path
      const pathParts = path.split('/');
      const orderId = pathParts[pathParts.length - 1];
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Order ID required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      console.log('🗑️ Deleting order:', orderId);
      
      try {
        // Delete the order from KV store
        await kv.del(`order:${orderId}`);
        
        // Also delete associated shipment if exists
        try {
          await kv.del(`shipment:${orderId}`);
        } catch (e) {
          console.log('⚠️ No shipment to delete for', orderId);
        }
        
        console.log('✅ Order deleted successfully:', orderId);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Order ${orderId} deleted successfully`,
            orderId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        console.error('❌ Failed to delete order:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TEST TELEGRAM =============
    if (path.includes('test-telegram') && req.method === 'GET') {
      console.log('📱 TEST TELEGRAM');
      
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
      const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
      
      const secretsStatus = {
        hasBotToken: !!botToken,
        hasChatId: !!chatId,
        botTokenPreview: botToken ? `${botToken.substring(0, 10)}...` : 'NOT SET',
        chatIdValue: chatId || 'NOT SET'
      };
      
      if (!botToken || !chatId) {
        return new Response(
          JSON.stringify({ 
            error: 'Telegram secrets not configured',
            secretsStatus 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Try to send a test message
      try {
        const testMessage = '🔔 *Test Notification*\\n\\nThis is a test from Forged Initials server\\!';
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: testMessage,
            parse_mode: 'MarkdownV2'
          })
        });
        
        const result = await response.json();
        
        return new Response(
          JSON.stringify({ 
            success: response.ok,
            secretsStatus,
            telegramResponse: result,
            statusCode: response.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send test message',
            secretsStatus,
            details: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= STRIPE WEBHOOK =============
    if (path.includes('stripe-webhook') && req.method === 'POST') {
      console.log('💳 STRIPE WEBHOOK');
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        console.error('❌ Missing stripe-signature header');
        return new Response(
          JSON.stringify({ error: 'Missing stripe-signature header' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const rawBody = await req.text();
      const result = await handleStripeWebhook(rawBody, signature);
      
      // Send Telegram notification if order was created
      if (result.order && result.itemizedPricing) {
        // Convert itemizedPricing to pricingBreakdown format for notifications
        const pricingBreakdown = {
          lettersSubtotal: result.itemizedPricing.lettersSubtotal || 0,
          hardwareTotal: result.itemizedPricing.hardwareTotal || 0,
          assemblyFee: result.itemizedPricing.assemblyFee || 0,
          shipping: result.itemizedPricing.shipping || 10,
          total: result.itemizedPricing.total || 0,
        };
        await sendTelegramNotification(result.order, pricingBreakdown, 'Stripe');
      }
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= TEST STRIPE PAYMENT (bypasses signature verification) =============
    if (path.includes('test-stripe-payment') && req.method === 'POST') {
      console.log('🧪 TEST STRIPE PAYMENT');
      const body = await req.json();
      
      // Simulate successful payment event
      const event = body;
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const metadata = session.metadata || {};
        
        // Parse items from metadata
        let items = [];
        try {
          items = JSON.parse(metadata.items || '[]');
        } catch (e) {
          console.error('Failed to parse items:', e);
        }
        
        // Build order object
        const order = {
          orderId: metadata.orderId || `TEST-${Date.now()}`,
          customerName: metadata.customerName || session.customer_details?.name || 'Test Customer',
          email: metadata.email || session.customer_details?.email || 'test@example.com',
          items: items,
          addressLine1: metadata.addressLine1 || '',
          addressLine2: metadata.addressLine2 || '',
          city: metadata.city || '',
          stateOrProvinceCode: metadata.stateOrProvinceCode || '',
          postalCode: metadata.postalCode || '',
          phoneNumber: metadata.phoneNumber || '',
          details: metadata.details || '',
        };
        
        // Calculate pricing breakdown
        const total = (session.amount_total || 0) / 100;
        const pricingBreakdown = {
          lettersSubtotal: total * 0.7,
          hardwareTotal: total * 0.1,
          assemblyFee: total * 0.1,
          shipping: 10.00,
          total: total
        };
        
        // Store order (you can add this later if needed)
        console.log('📝 Test order:', order);
        
        // Send Telegram notification
        try {
          await sendTelegramNotification(order, pricingBreakdown, 'Stripe (Test)');
          return new Response(
            JSON.stringify({ success: true, message: 'Test payment processed and notification sent', order }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, message: 'Test payment processed but notification failed', error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid event type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // ============= CREATE PAYMENT INTENT =============
    if (path.includes('create-payment-intent') && req.method === 'POST') {
      console.log('💰 CREATE PAYMENT INTENT');
      const body = await req.json();
      const result = await createPaymentIntent(body);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= CREATE CHECKOUT SESSION =============
    if (path.includes('create-checkout-session') && req.method === 'POST') {
      console.log('🛒 CREATE CHECKOUT SESSION');
      const body = await req.json();
      
      // Get success and cancel URLs from request or construct defaults
      const baseUrl = req.headers.get('origin') || 'https://forged-initials.com';
      const successUrl = body.successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = body.cancelUrl || `${baseUrl}/`;
      
      const result = await createCheckoutSession({
        items: body.items,
        currency: body.currency || 'usd',
        successUrl,
        cancelUrl,
        customerEmail: body.customerEmail,
        metadata: body.metadata,
      });
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= CASH APP PAYMENT =============
    if (path.includes('cashapp-payment') && req.method === 'POST') {
      console.log('💵 CASH APP PAYMENT');
      const body = await req.json();
      
      // Build order object from request data
      const orderId = `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const order = {
        id: orderId,
        orderId: orderId,
        customerName: body.customerName || 'Unknown',
        email: body.email || '',
        items: body.items || [],
        bailOptions: body.bailOptions || [],
        prongsOptions: body.prongsOptions || [],
        material: body.material || 'sterling-silver',
        details: body.details || '',
        amount: body.amount || 0,
        currency: 'usd',
        status: 'pending-verification',
        paymentMethod: 'cashapp',
        addressLine1: body.addressLine1 || '',
        addressLine2: body.addressLine2 || '',
        city: body.city || '',
        stateOrProvinceCode: body.stateOrProvinceCode || '',
        postalCode: body.postalCode || '',
        phoneNumber: body.phoneNumber || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Calculate pricing breakdown
      const lettersSubtotal = body.lettersSubtotal || 0;
      const hardwareTotal = body.hardwareTotal || 0;
      const assemblyFee = body.assemblyFee || 0;
      const shipping = 10.00;
      const total = body.amount || 0;
      
      const pricingBreakdown = {
        lettersSubtotal,
        hardwareTotal,
        assemblyFee,
        shipping,
        total
      };
      
      // Store order in KV
      try {
        await kv.set(`order:${orderId}`, order);
        console.log('✅ Order stored:', orderId);
      } catch (error) {
        console.error('❌ Failed to store order:', error);
      }
      
      // Send Telegram notification
      console.log('📱 Sending Telegram notification for order:', orderId);
      try {
        await notifyCashAppPayment(order, pricingBreakdown);
        console.log('✅ Notification sent successfully');
        
        return new Response(
          JSON.stringify({ success: true, message: 'Cash App payment notification sent', orderId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        console.error('❌ Notification failed:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Cash App payment received but notification failed',
            error: error.message,
            orderId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }
    
    // ============= CREATE SHIPMENT =============
    if (path.includes('create-shipment') && req.method === 'POST') {
      console.log('📦 CREATE SHIPMENT');
      const body = await req.json();
      const result = await createFedExShipment(body.order, body.items);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= TEST FEDEX AUTHENTICATION =============
    if (path.includes('test-fedex-auth') && req.method === 'POST') {
      console.log('🔐 TEST FEDEX AUTH');
      
      try {
        // Try to get FedEx access token
        const clientId = Deno.env.get('FEDEX_CLIENT_ID');
        const clientSecret = Deno.env.get('FEDEX_CLIENT_SECRET');
        const useSandbox = Deno.env.get('FEDEX_USE_SANDBOX') !== 'false';
        const useMock = Deno.env.get('FEDEX_USE_MOCK') === 'true';
        
        const config = {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          useSandbox,
          useMock,
          environment: useMock ? 'MOCK' : (useSandbox ? 'SANDBOX' : 'PRODUCTION')
        };
        
        if (useMock) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Running in MOCK mode - no actual FedEx API calls',
              config 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'FedEx credentials not configured',
              config 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Attempt authentication
        const fedexAuthUrl = useSandbox 
          ? 'https://apis-sandbox.fedex.com/oauth/token'
          : 'https://apis.fedex.com/oauth/token';
          
        const response = await fetch(fedexAuthUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'FedEx authentication successful',
              config,
              tokenPreview: data.access_token ? `${data.access_token.substring(0, 20)}...` : 'N/A'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } else {
          const error = await response.text();
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'FedEx authentication failed',
              error,
              config,
              hint: useSandbox 
                ? 'Your credentials might be for PRODUCTION. Try setting FEDEX_USE_SANDBOX=false'
                : 'Your credentials might be for SANDBOX. Try setting FEDEX_USE_SANDBOX=true'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Test failed',
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TEST FEDEX LABEL GENERATION =============
    if (path.includes('test-fedex-label') && req.method === 'POST') {
      console.log('🏷️ TEST FEDEX LABEL');
      
      try {
        const body = await req.json();
        const result = await createFedExShipment(
          body.orderId,
          body.shippingAddress,
          body.packageDetails
        );
        
        // Check if we got a mock fallback
        const isMockFallback = result.trackingNumber?.startsWith('MOCK-FALLBACK');
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: isMockFallback 
              ? '⚠️ Label created (FALLBACK MODE) - Real FedEx API failed'
              : 'Label created successfully',
            trackingNumber: result.trackingNumber,
            labelUrl: result.labelUrl,
            shipment: result,
            warning: isMockFallback ? 'Using mock fallback - check server logs for FedEx API error' : null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Label creation failed',
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TEST ADDRESS VALIDATION =============
    if (path.includes('test-address-validation') && req.method === 'POST') {
      console.log('📍 TEST ADDRESS VALIDATION');
      
      try {
        const body = await req.json();
        const { validAddress, invalidAddress } = body;
        
        let validPassed = false;
        let invalidBlocked = false;
        let validError = null;
        let invalidError = null;
        
        // Test valid Houston address - should succeed
        try {
          await createFedExShipment(
            `TEST-VALID-${Date.now()}`,
            {
              fullName: 'Test Customer',
              addressLine1: '1000 Main St',
              ...validAddress,
              countryCode: 'US',
              phoneNumber: '7135551234'
            },
            { weight: 0.5 }
          );
          validPassed = true;
        } catch (error) {
          validError = error.message;
        }
        
        // Test invalid non-Houston address - should fail
        try {
          await createFedExShipment(
            `TEST-INVALID-${Date.now()}`,
            {
              fullName: 'Test Customer',
              addressLine1: '1000 Main St',
              ...invalidAddress,
              countryCode: 'US',
              phoneNumber: '7135551234'
            },
            { weight: 0.5 }
          );
        } catch (error) {
          if (error.message.includes('Houston')) {
            invalidBlocked = true;
          }
          invalidError = error.message;
        }
        
        return new Response(
          JSON.stringify({ 
            success: validPassed && invalidBlocked,
            validPassed,
            invalidBlocked,
            message: validPassed && invalidBlocked 
              ? 'Address validation working correctly'
              : 'Address validation not working as expected',
            details: {
              validTest: validPassed ? 'Passed' : `Failed: ${validError}`,
              invalidTest: invalidBlocked ? 'Blocked correctly' : `Not blocked: ${invalidError}`
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Test failed',
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TEST TRACKING =============
    if (path.includes('test-tracking') && req.method === 'POST') {
      console.log('📦 TEST TRACKING');
      
      try {
        const body = await req.json();
        const { orderId } = body;
        
        // Create a test shipment first
        const shipment = await createFedExShipment(
          orderId,
          {
            fullName: 'Test Customer',
            addressLine1: '1000 Main St',
            city: 'Houston',
            stateOrProvinceCode: 'TX',
            postalCode: '77002',
            countryCode: 'US',
            phoneNumber: '7135551234'
          },
          { weight: 0.5 }
        );
        
        // Now try to retrieve it
        const retrieved = await getShipmentDetails(orderId);
        
        return new Response(
          JSON.stringify({ 
            success: !!retrieved,
            message: retrieved ? 'Tracking system working' : 'Failed to retrieve shipment',
            trackingNumber: shipment.trackingNumber,
            shipment: retrieved
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Tracking test failed',
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TEST FULL INTEGRATION =============
    if (path.includes('test-full-integration') && req.method === 'POST') {
      console.log('🔄 TEST FULL INTEGRATION');
      
      try {
        const body = await req.json();
        
        // 1. Create order
        const order = {
          orderId: body.orderId,
          customerName: body.customerName,
          email: body.email,
          items: body.items,
          addressLine1: body.addressLine1,
          city: body.city,
          stateOrProvinceCode: body.stateOrProvinceCode,
          postalCode: body.postalCode,
          phoneNumber: body.phoneNumber,
          createdAt: new Date().toISOString(),
          status: 'processing'
        };
        
        await kv.set(`order:${order.orderId}`, order);
        
        // 2. Create shipment
        const shipment = await createFedExShipment(
          order.orderId,
          {
            fullName: order.customerName,
            addressLine1: order.addressLine1,
            city: order.city,
            stateOrProvinceCode: order.stateOrProvinceCode,
            postalCode: order.postalCode,
            countryCode: 'US',
            phoneNumber: order.phoneNumber
          },
          { weight: 0.5 }
        );
        
        // 3. Retrieve via tracking
        const trackingData = await kv.get(`shipment:${order.orderId}`);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Full integration test passed',
            steps: {
              orderCreated: !!order,
              shipmentCreated: !!shipment,
              trackingRetrieved: !!trackingData
            },
            data: {
              order,
              shipment,
              tracking: trackingData
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Integration test failed',
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= TRACK ORDER =============
    if (path.match(/track\/[^/]+$/) && req.method === 'GET') {
      console.log('🔍 TRACK ORDER');
      const orderId = path.split('/').pop();
      
      try {
        // Get order details
        const order = await kv.get(`order:${orderId}`);
        
        if (!order) {
          return new Response(
            JSON.stringify({ error: 'Order not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        
        // Get shipment details (if exists)
        const shipment = await getShipmentDetails(orderId);
        
        return new Response(
          JSON.stringify({ 
            order: {
              ...order,
              orderDate: order.createdAt || order.orderDate || new Date().toISOString(),
              status: order.status || 'processing'
            },
            shipment 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        console.error('Error tracking order:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve tracking information' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= ORDERS - GET ONE =============
    if (path.match(/orders\/[^/]+$/) && req.method === 'GET') {
      console.log('📄 GET ORDER');
      const orderId = path.split('/').pop();
      const order = await kv.get(`order:${orderId}`);
      
      if (!order) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      return new Response(
        JSON.stringify({ order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // ============= ORDERS - CREATE =============
    if (path.includes('orders') && req.method === 'POST') {
      console.log('➕ CREATE ORDER');
      const body = await req.json();
      const orderId = `FI-${Date.now()}`;
      
      const order = {
        id: orderId,
        ...body,
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`order:${orderId}`, order);
      
      return new Response(
        JSON.stringify({ success: true, orderId, order }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }
    
    // ============= CONTACT FORM =============
    if (path.includes('contact') && req.method === 'POST') {
      console.log('📧 CONTACT FORM SUBMISSION');
      const body = await req.json();
      
      const { firstName, lastName, email, phone, subject, message, attachments = [] } = body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !subject || !message) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Missing required fields' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Send to Telegram
      try {
        await sendContactFormToTelegram(firstName, lastName, email, phone, subject, message, attachments);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Your message has been sent successfully! We\'ll get back to you soon.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        console.error('❌ Contact form error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Failed to send message. Please try again or contact us on Instagram.',
            error: error.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // ============= 404 NOT FOUND =============
    console.log('❌ Path not found:', path);
    return new Response(
      JSON.stringify({ 
        error: 'Not found',
        receivedPath: path,
        receivedMethod: req.method,
        availableEndpoints: [
          'GET /health',
          'POST /stripe-webhook',
          'POST /create-payment-intent',
          'POST /create-checkout-session',
          'POST /cashapp-payment',
          'POST /create-shipment',
          'GET /orders',
          'GET /orders/:id',
          'POST /orders',
          'POST /contact'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
    
  } catch (error) {
    console.error('❌ Unhandled error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});