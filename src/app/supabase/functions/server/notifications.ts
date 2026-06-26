// Telegram notification functions

interface OrderItem {
  letter: string;
  quantity: number;
  size: string;
}

interface HardwareOption {
  type?: string;
  quantity: number;
  size: string;
}

interface Order {
  orderId?: string;
  id?: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  bailOptions?: HardwareOption[];
  prongsOptions?: HardwareOption[];
  material?: string;
  details?: string;
  amount?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateOrProvinceCode?: string;
  postalCode?: string;
  phoneNumber?: string;
}

interface PricingBreakdown {
  lettersSubtotal: number;
  hardwareTotal: number;
  assemblyFee: number;
  shipping: number;
  total: number;
}

// Helper function to escape special characters for Telegram MarkdownV2
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Helper function for numbers/prices (escapes dots)
function escapePrice(amount: number): string {
  return amount.toFixed(2).replace(/\./g, '\\.');
}

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}

export async function sendTelegramNotification(order: Order, pricingBreakdown: PricingBreakdown, paymentMethod: string = 'Stripe'): Promise<void> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    console.log('🔍 Telegram credentials check:', {
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
      botTokenPreview: botToken ? `${botToken.substring(0, 10)}...` : 'NOT SET'
    });
    
    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram bot token or chat ID not configured. Skipping notification.');
      return;
    }

    const orderId = order.orderId || order.id || 'UNKNOWN';
    
    console.log('📝 Building message for order:', orderId);
    
    // Build the message with HTML formatting (much easier than MarkdownV2!)
    let message = `🎉 <b>NEW ORDER: ${escapeHtml(orderId)}</b>\n\n`;
    message += `👤 <b>Customer:</b> ${escapeHtml(order.customerName)}\n`;
    message += `📧 <b>Email:</b> ${escapeHtml(order.email)}\n`;
    message += `💳 <b>Payment:</b> ${escapeHtml(paymentMethod)}\n`;
    message += `💰 <b>Total:</b> $${pricingBreakdown.total.toFixed(2)}\n\n`;
    
    // Add items
    if (order.items && order.items.length > 0) {
      message += `💎 <b>Items:</b>\n`;
      order.items.forEach((item: OrderItem) => {
        message += `  • ${item.quantity}x ${escapeHtml(item.letter)} (${escapeHtml(item.size)})\n`;
      });
      message += `\n`;
    }
    
    // Add bails if present
    if (order.bailOptions && order.bailOptions.length > 0) {
      message += `🔗 <b>Bails:</b>\n`;
      order.bailOptions.forEach((bail: HardwareOption) => {
        message += `  • ${bail.quantity}x Bail (${escapeHtml(bail.size)})\n`;
      });
      message += `\n`;
    }
    
    // Add prongs if present
    if (order.prongsOptions && order.prongsOptions.length > 0) {
      message += `⚙️ <b>Prongs:</b>\n`;
      order.prongsOptions.forEach((prong: HardwareOption) => {
        const displaySize = prong.size === 'half-carat' ? '½ Carat' : prong.size === '1-carat' ? '1 Carat' : prong.size;
        message += `  • ${prong.quantity}x Prong (${escapeHtml(displaySize)})\n`;
      });
      message += `\n`;
    }
    
    // Add pricing breakdown
    message += `💰 <b>Pricing Breakdown:</b>\n`;
    message += `  Letters: $${pricingBreakdown.lettersSubtotal.toFixed(2)}\n`;
    message += `  Hardware: $${pricingBreakdown.hardwareTotal.toFixed(2)}\n`;
    message += `  Assembly: $${pricingBreakdown.assemblyFee.toFixed(2)}\n`;
    message += `  Shipping: $${pricingBreakdown.shipping.toFixed(2)}\n\n`;
    
    // Add address if available
    if (order.addressLine1 && order.city && order.stateOrProvinceCode) {
      message += `📍 <b>Address:</b>\n`;
      message += `${escapeHtml(order.addressLine1)}\n`;
      if (order.addressLine2) {
        message += `${escapeHtml(order.addressLine2)}\n`;
      }
      message += `${escapeHtml(order.city)}, ${escapeHtml(order.stateOrProvinceCode)} ${escapeHtml(order.postalCode || '')}\n\n`;
    }
    
    // Add phone if available
    if (order.phoneNumber) {
      message += `📱 <b>Phone:</b> ${escapeHtml(order.phoneNumber)}\n\n`;
    }
    
    // Add notes if available
    if (order.details) {
      message += `📝 <b>Notes:</b> ${escapeHtml(order.details)}\n`;
    }

    console.log('📤 Sending message to Telegram...');
    console.log('Message preview:', message.substring(0, 100) + '...');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    
    console.log('📬 Telegram API response:', {
      ok: response.ok,
      status: response.status,
      result: result
    });
    
    if (!response.ok) {
      console.error('❌ Telegram notification failed:', response.status, result);
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    } else {
      console.log('✅ Telegram notification sent successfully!');
    }
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    // Re-throw the error so the caller knows it failed
    throw error;
  }
}

// Legacy function for Cash App payments (now uses Telegram)
export async function notifyCashAppPayment(order: Order, pricingBreakdown: PricingBreakdown): Promise<void> {
  return sendTelegramNotification(order, pricingBreakdown, 'Cash App');
}

export async function sendTrackingEmail(order: Order, trackingNumber: string, carrierCode: string): Promise<{ success: boolean; message: string }> {
  console.log(`📧 Tracking email for order ${order.orderId || order.id}: ${trackingNumber} (${carrierCode})`);
  // TODO: Implement email sending
  return { success: true, message: 'Email sending not yet implemented' };
}

export async function sendOrderReceiptEmail(
  recipientEmail: string,
  customerName: string,
  orderId: string,
  items: OrderItem[],
  pendantStyle: string,
  material: string,
  pricingBreakdown: PricingBreakdown,
  paymentMethod: string,
  details?: string
): Promise<{ success: boolean; message: string }> {
  console.log(`📧 Receipt email for order ${orderId} to ${recipientEmail}`);
  // TODO: Implement email sending
  return { success: true, message: 'Email sending not yet implemented' };
}

// Contact form Telegram notification
export async function sendContactFormToTelegram(
  firstName: string,
  lastName: string,
  email: string,
  phone: string | undefined,
  subject: string,
  message: string
): Promise<void> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    console.log('🔍 Telegram credentials check for contact form:', {
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
    });
    
    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram bot token or chat ID not configured. Skipping notification.');
      throw new Error('Telegram not configured');
    }

    // Build the message with HTML formatting
    let telegramMessage = `💬 <b>NEW CONTACT FORM MESSAGE</b>\n\n`;
    telegramMessage += `👤 <b>Name:</b> ${escapeHtml(firstName)} ${escapeHtml(lastName)}\n`;
    telegramMessage += `📧 <b>Email:</b> ${escapeHtml(email)}\n`;
    
    if (phone) {
      telegramMessage += `📱 <b>Phone:</b> ${escapeHtml(phone)}\n`;
    }
    
    telegramMessage += `\n📋 <b>Subject:</b> ${escapeHtml(subject)}\n\n`;
    telegramMessage += `💭 <b>Message:</b>\n${escapeHtml(message)}`;

    console.log('📤 Sending contact form to Telegram...');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    
    console.log('📬 Telegram API response:', {
      ok: response.ok,
      status: response.status,
      result: result
    });
    
    if (!response.ok) {
      console.error('❌ Telegram notification failed:', response.status, result);
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    } else {
      console.log('✅ Contact form sent to Telegram successfully!');
    }
  } catch (error) {
    console.error('❌ Error sending contact form to Telegram:', error);
    throw error;
  }
}