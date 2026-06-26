import Stripe from 'https://esm.sh/stripe@17?dts';
import * as kv from './kv_store.ts';
// Removed notifyNewOrder import to avoid circular dependency
// Notifications are now sent from index.tsx after webhook handling
import { ShippingAddress, createFedExShipment, estimatePackageWeight } from './shipping.ts';

// Validate and get Stripe API key
function getStripeKey(): string {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  
  console.log('🔑 Checking Stripe key:', {
    isSet: !!key,
    length: key ? key.length : 0,
    prefix: key ? key.substring(0, 7) : 'N/A'
  });
  
  if (!key || key.trim() === '') {
    console.error('❌ STRIPE_SECRET_KEY is not set!');
    throw new Error('STRIPE_SECRET_KEY environment variable is not set. Please configure your Stripe secret key.');
  }
  
  // Validate key format
  if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    console.error(`❌ Invalid Stripe key format detected. Key should start with 'sk_test_' or 'sk_live_'. Received: ${key.substring(0, 10)}...`);
    throw new Error('Invalid Stripe API key format. Key must start with sk_test_ or sk_live_');
  }
  
  console.log('✅ Stripe key validation passed');
  return key;
}

// Lazy initialization of Stripe to avoid errors at module load time
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeKey(), {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeInstance;
}

export interface LetterItem {
  letter: string;
  quantity: number;
  size: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'; // Each item has its own size
}

export interface BailOption {
  size: string;
  quantity: number;
  price?: number;
}

export interface ProngOption {
  size: string;
  quantity: number;
  price?: number;
}

export interface OrderData {
  id: string;
  customerName: string;
  email: string;
  items: LetterItem[]; // Each item has letter, quantity, and size
  bailOptions?: BailOption[];
  prongsOptions?: ProngOption[];
  material: 'sterling-silver' | '14k-gold' | '18k-gold' | 'rose-gold' | 'white-gold';
  details: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'cashapp' | string;
  shippingAddress?: ShippingAddress;
  // Add shipping address fields directly to OrderData for easier access
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateOrProvinceCode?: string;
  postalCode?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Size-based pricing for sterling silver (in USD)
const SIZE_PRICES = {
  'extra-small': 1,
  'small': 2,
  'medium': 3,
  'large': 4,
  'extra-large': 5,
};

// Shipping fee (flat rate for Houston local delivery)
const SHIPPING_FEE = 10;

// Bail pricing based on size
const BAIL_PRICES = {
  'xs': 1.5,
  's': 2.0,
  'm': 2.5,
  'l': 3.0,
};

// Prong pricing based on size
const PRONG_PRICES = {
  'xs': 1.25,
  's': 1.75,
  'm': 2.25,
  'l': 2.75,
};

// Assembly fees for pendant styles
const ASSEMBLY_FEES = {
  'connected': 15,
  'bar': 25,
  'separated': 0,
  'none': 0,
};

// Jump ring pricing
const JUMP_RING_PRICE = 0.5;

export function calculateOrderPrice(
  material: string,
  items: LetterItem[],
  pendantStyle?: string,
  bailOptions?: BailOption[],
  extraJumpRings?: number,
  prongOptions?: ProngOption[]
): number {
  const breakdown = calculateOrderPriceBreakdown(material, items, pendantStyle, bailOptions, extraJumpRings, prongOptions);
  return breakdown.total;
}

export function calculateOrderPriceBreakdown(
  material: string,
  items: LetterItem[],
  pendantStyle: string = 'none',
  bailOptions: BailOption[] = [],
  extraJumpRings: number = 0,
  prongOptions: ProngOption[] = []
): { 
  items: { letter: string; quantity: number; size: string; basePrice: number; sizeMultiplier: number; itemTotal: number }[];
  lettersSubtotal: number;
  hardware: { type: string; size: string; quantity: number; unitPrice: number; total: number }[];
  hardwareTotal: number;
  assemblyFee: number;
  pendantStyle: string;
  shipping: number;
  subtotal: number;
  total: number;
} {
  // Only sterling silver is supported
  if (material !== 'sterling-silver') {
    console.warn(`Unsupported material: ${material}. Using sterling-silver pricing.`);
  }
  
  // Build itemized letter breakdown
  const itemizedItems = items.map(item => {
    const basePrice = SIZE_PRICES[item.size as keyof typeof SIZE_PRICES] || 3;
    const itemTotal = basePrice * item.quantity;
    return {
      letter: item.letter,
      quantity: item.quantity,
      size: item.size,
      basePrice,
      sizeMultiplier: 1,
      itemTotal,
    };
  });
  
  const lettersSubtotal = itemizedItems.reduce((sum, item) => sum + item.itemTotal, 0);
  
  // Build itemized hardware breakdown
  const hardwareItems = [];
  
  // Bail items
  if (bailOptions && bailOptions.length > 0) {
    for (const bail of bailOptions) {
      const bailPrice = bail.price || BAIL_PRICES[bail.size as keyof typeof BAIL_PRICES] || 0;
      hardwareItems.push({
        type: 'Bail',
        size: bail.size.toUpperCase(),
        quantity: bail.quantity,
        unitPrice: bailPrice,
        total: bailPrice * bail.quantity,
      });
    }
  }
  
  // Prong items
  if (prongOptions && prongOptions.length > 0) {
    for (const prong of prongOptions) {
      const prongPrice = prong.price || PRONG_PRICES[prong.size as keyof typeof PRONG_PRICES] || 0;
      hardwareItems.push({
        type: 'Prong',
        size: prong.size.toUpperCase(),
        quantity: prong.quantity,
        unitPrice: prongPrice,
        total: prongPrice * prong.quantity,
      });
    }
  }
  
  // Jump ring items
  if (extraJumpRings && extraJumpRings > 0) {
    hardwareItems.push({
      type: 'Jump Ring',
      size: 'XS',
      quantity: extraJumpRings,
      unitPrice: JUMP_RING_PRICE,
      total: JUMP_RING_PRICE * extraJumpRings,
    });
  }
  
  const hardwareTotal = hardwareItems.reduce((sum, hw) => sum + hw.total, 0);
  
  // Calculate assembly fee based on pendant style
  const assemblyFee = ASSEMBLY_FEES[pendantStyle as keyof typeof ASSEMBLY_FEES] || 0;
  
  // Calculate totals
  const subtotal = lettersSubtotal + hardwareTotal + assemblyFee;
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;
  
  return { 
    items: itemizedItems,
    lettersSubtotal,
    hardware: hardwareItems,
    hardwareTotal,
    assemblyFee,
    pendantStyle,
    shipping,
    subtotal,
    total 
  };
}

// Enhanced pricing breakdown with itemized details for receipts
export function calculateItemizedPricing(
  material: string,
  items: LetterItem[]
): {
  items: { letter: string; quantity: number; size: string; pricePerLetter: number; itemTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
} {
  // Only sterling silver is supported
  if (material !== 'sterling-silver') {
    console.warn(`Unsupported material: ${material}. Using sterling-silver pricing.`);
  }
  
  const itemizedItems = items.map(item => {
    const pricePerLetter = SIZE_PRICES[item.size as keyof typeof SIZE_PRICES] || 3;
    const itemTotal = pricePerLetter * item.quantity;
    return {
      letter: item.letter,
      quantity: item.quantity,
      size: item.size,
      pricePerLetter: pricePerLetter,
      itemTotal: itemTotal,
    };
  });

  const subtotal = itemizedItems.reduce((total, item) => total + item.itemTotal, 0);
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;

  return {
    items: itemizedItems,
    subtotal,
    shipping,
    total,
  };
}

// Create Stripe Checkout Session (redirect flow)
export async function createCheckoutSession({
  items,
  currency = 'usd',
  successUrl,
  cancelUrl,
  customerEmail,
  metadata,
}: {
  items: { name: string; description?: string; unitAmount: number; quantity: number }[];
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const stripe = getStripe();

    // Convert items to Stripe line items format
    const lineItems = items.map(item => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: item.unitAmount, // Already in cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    console.log('Creating Stripe checkout session with params:', {
      lineItemsCount: lineItems.length,
      mode: 'payment',
      successUrl,
      cancelUrl,
      customerEmail,
      metadataKeys: Object.keys(metadata || {})
    });

    // Create Stripe Checkout session with multiple payment methods
    // Customers can pay with: Credit/Debit Card, Cash App, or Link
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'cashapp', 'link'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        source: 'forged-initials',
        ...metadata,
      },
    });

    console.log('Stripe session created successfully:', {
      id: session.id,
      hasUrl: !!session.url,
      url: session.url,
      status: session.status,
      payment_status: session.payment_status
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error.type === 'StripeAuthenticationError') {
      throw new Error('Stripe authentication failed. Invalid API key configured.');
    } else if (error.type === 'StripeAPIError') {
      throw new Error('Stripe API error: ' + (error.message || 'Unknown error'));
    } else if (error.message && error.message.includes('STRIPE_SECRET_KEY')) {
      throw new Error('Stripe API key is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    
    throw error;
  }
}

export async function createPaymentIntent(orderData: Omit<OrderData, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  try {
    console.log('Calculating order price...');
    const amount = calculateOrderPrice(orderData.material, orderData.items);
    console.log('Order amount:', amount);
    
    // Generate consistent Order ID with ORDER- prefix
    const orderId = `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    console.log('Generated order ID:', orderId);
    
    // Get Stripe instance (this will validate the API key)
    console.log('Initializing Stripe...');
    const stripe = getStripe();
    
    // Create Stripe payment intent
    console.log('Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: orderData.currency || 'usd',
      metadata: {
        customerName: orderData.customerName,
        email: orderData.email,
        items: JSON.stringify(orderData.items),
        material: orderData.material,
        orderId: orderId, // Add orderId to Stripe metadata
      },
      description: `Custom Letter Jewelry - ${orderData.items.map(item => `${item.letter}×${item.quantity} ${item.size}`).join(', ')} (${orderData.material})`,
    });

    console.log('Stripe payment intent created:', paymentIntent.id);

    // Create order record
    const order: OrderData = {
      ...orderData,
      id: orderId,
      amount,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store order in KV store
    console.log('Storing order in KV store...');
    await kv.set(`order:${order.id}`, order);
    await kv.set(`order:payment:${paymentIntent.id}`, order.id);
    console.log('Order stored successfully');

    // Note: Notifications are sent when payment succeeds via webhook to avoid duplicate notifications
    // Initial order creation doesn't send notifications until payment is confirmed

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Provide more helpful error messages
    if (error.type === 'StripeAuthenticationError') {
      throw new Error('Stripe authentication failed. Invalid API key configured.');
    } else if (error.type === 'StripeAPIError') {
      throw new Error('Stripe API error: ' + (error.message || 'Unknown error'));
    } else if (error.message && error.message.includes('STRIPE_SECRET_KEY')) {
      throw new Error('Stripe API key is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
    
    throw error;
  }
}

export async function handleStripeWebhook(body: string, signature: string): Promise<{ received: true; order?: OrderData; itemizedPricing?: any; eventType?: string }> {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  try {
    const event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        // Extract order data from metadata
        if (session.metadata) {
          const orderId = `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          
          // 🎯 Try to parse complete order_data first (from Option B enhancement)
          let orderData: any = null;
          if (session.metadata.order_data) {
            try {
              orderData = JSON.parse(session.metadata.order_data);
              console.log('📦 Parsed complete order data from metadata');
            } catch (e) {
              console.error('Failed to parse order_data from metadata:', e);
            }
          }
          
          // Parse items from metadata (fallback to old method)
          let items = [];
          try {
            items = orderData?.items || JSON.parse(session.metadata.items || '[]');
          } catch (e) {
            console.error('Failed to parse items from metadata:', e);
          }
          
          // Parse hardware options from metadata
          let bailOptions = [];
          let prongsOptions = [];
          try {
            bailOptions = orderData?.bailOptions || JSON.parse(session.metadata.bailOptions || '[]');
          } catch (e) {
            console.error('Failed to parse bailOptions:', e);
          }
          try {
            prongsOptions = orderData?.prongsOptions || JSON.parse(session.metadata.prongsOptions || '[]');
          } catch (e) {
            console.error('Failed to parse prongsOptions:', e);
          }
          
          const order: OrderData = {
            id: orderId,
            customerName: orderData?.customerName || session.metadata.customerName || session.customer_details?.name || 'Unknown',
            email: orderData?.email || session.customer_details?.email || session.metadata.email || '',
            items: items,
            bailOptions: bailOptions,
            prongsOptions: prongsOptions,
            material: (orderData?.material || session.metadata.material || 'sterling-silver') as any,
            details: orderData?.details || session.metadata.details || '',
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            status: 'paid',
            paymentMethod: 'stripe',
            paymentIntentId: session.payment_intent as string,
            addressLine1: orderData?.addressLine1 || session.metadata.addressLine1,
            addressLine2: orderData?.addressLine2 || session.metadata.addressLine2,
            city: orderData?.city || session.metadata.city,
            stateOrProvinceCode: orderData?.stateOrProvinceCode || session.metadata.state || session.metadata.stateOrProvinceCode,
            postalCode: orderData?.postalCode || session.metadata.postalCode,
            phoneNumber: orderData?.phoneNumber || session.metadata.phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Store order in KV
          await kv.set(`order:${orderId}`, order);
          await kv.set(`order:session:${session.id}`, orderId);
          if (session.payment_intent) {
            await kv.set(`order:payment:${session.payment_intent}`, orderId);
          }
          
          console.log('💾 Order created from checkout session:', orderId);
          
          // Calculate itemized pricing
          const pendantStyle = orderData?.pendantStyle || session.metadata.pendantStyle || 'none';
          const extraJumpRings = parseInt(orderData?.extraJumpRings || session.metadata.extraJumpRings || '0');
          
          console.log('💰 Calculating pricing:', { pendantStyle, bailOptions, prongsOptions, extraJumpRings });
          
          const itemizedPricing = calculateOrderPriceBreakdown(
            order.material,
            order.items,
            pendantStyle,
            bailOptions,
            extraJumpRings,
            prongsOptions
          );
          
          console.log('✅ Order ready for notification:', { orderId, total: itemizedPricing.total });
          
          return { received: true, order, itemizedPricing, eventType: 'checkout.session.completed' };
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = await kv.get(`order:payment:${paymentIntent.id}`);
        
        if (orderId) {
          const order = await kv.get(`order:${orderId}`);
          if (order) {
            order.status = 'paid';
            order.updatedAt = new Date().toISOString();
            await kv.set(`order:${orderId}`, order);
            
            // Calculate itemized pricing for receipt email
            const itemizedPricing = calculateItemizedPricing(order.material, order.items);
            
            // Note: Notifications are sent from index.tsx webhook handler to avoid circular dependencies
            // Return order and pricing data for notification handling
            order.itemizedPricing = itemizedPricing;
            
            // Auto-generate FedEx shipping label if shipping address is provided
            if (order.shippingAddress && 
                order.shippingAddress.addressLine1 && 
                order.shippingAddress.city && 
                order.shippingAddress.stateOrProvinceCode &&
                order.shippingAddress.postalCode &&
                order.shippingAddress.phoneNumber) {
              
              try {
                console.log(`Auto-generating FedEx label for order ${orderId}...`);
                
                const shippingAddress: ShippingAddress = {
                  fullName: order.customerName,
                  addressLine1: order.shippingAddress.addressLine1,
                  addressLine2: order.shippingAddress.addressLine2,
                  city: order.shippingAddress.city,
                  stateOrProvinceCode: order.shippingAddress.stateOrProvinceCode,
                  postalCode: order.shippingAddress.postalCode,
                  countryCode: 'US', // Default to US
                  phoneNumber: order.shippingAddress.phoneNumber,
                };
                
                const packageWeight = estimatePackageWeight(order.items.reduce((total, item) => total + item.quantity, 0), order.material);
                
                const shipment = await createFedExShipment(
                  orderId,
                  shippingAddress,
                  { weight: packageWeight }
                );
                
                console.log(`FedEx label generated successfully for order ${orderId}. Tracking: ${shipment.trackingNumber}`);
              } catch (shippingError) {
                console.error(`Failed to auto-generate FedEx label for order ${orderId}:`, shippingError);
                // Don't fail the payment webhook if shipping label generation fails
                // You can manually generate the label later
              }
            } else {
              console.log(`No complete shipping address for order ${orderId}, skipping auto-label generation`);
            }
            
            // Return order and pricing for notification handling in index.tsx
            return { received: true, order, itemizedPricing };
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = await kv.get(`order:payment:${paymentIntent.id}`);
        
        if (orderId) {
          const order = await kv.get(`order:${orderId}`);
          if (order) {
            order.status = 'cancelled';
            order.updatedAt = new Date().toISOString();
            await kv.set(`order:${orderId}`, order);
          }
        }
        break;
      }
    }

    return { received: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

export async function getOrder(orderId: string): Promise<OrderData | null> {
  try {
    const order = await kv.get(`order:${orderId}`);
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function getAllOrders(): Promise<OrderData[]> {
  try {
    const orders = await kv.getByPrefix('order:');
    return orders
      .filter((order: OrderData) => order.id) // Filter out payment mappings
      .sort((a: OrderData, b: OrderData) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}