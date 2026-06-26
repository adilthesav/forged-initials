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

interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

function escapePrice(amount: number): string {
  return amount.toFixed(2).replace(/\./g, '\\.');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}

export async function sendTelegramNotification(order: Order, pricingBreakdown: PricingBreakdown, paymentMethod: string = 'Stripe'): Promise<void> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram bot token or chat ID not configured. Skipping notification.');
      return;
    }

    const orderId = order.orderId || order.id || 'UNKNOWN';
    
    let message = `🎉 <b>NEW ORDER: ${escapeHtml(orderId)}</b>\n\n`;
    message += `👤 <b>Customer:</b> ${escapeHtml(order.customerName)}\n`;
    message += `📧 <b>Email:</b> ${escapeHtml(order.email)}\n`;
    message += `💳 <b>Payment:</b> ${escapeHtml(paymentMethod)}\n`;
    message += `💰 <b>Total:</b> $${pricingBreakdown.total.toFixed(2)}\n\n`;
    
    if (order.items && order.items.length > 0) {
      message += `💎 <b>Items:</b>\n`;
      order.items.forEach((item: OrderItem) => {
        message += `  • ${item.quantity}x ${escapeHtml(item.letter)} (${escapeHtml(item.size)})\n`;
      });
      message += `\n`;
    }
    
    if (order.bailOptions && order.bailOptions.length > 0) {
      message += `🔗 <b>Bails:</b>\n`;
      order.bailOptions.forEach((bail: HardwareOption) => {
        message += `  • ${bail.quantity}x Bail (${escapeHtml(bail.size)})\n`;
      });
      message += `\n`;
    }
    
    if (order.prongsOptions && order.prongsOptions.length > 0) {
      message += `⚙️ <b>Prongs:</b>\n`;
      order.prongsOptions.forEach((prong: HardwareOption) => {
        const displaySize = prong.size === 'half-carat' ? '½ Carat' : prong.size === '1-carat' ? '1 Carat' : prong.size;
        message += `  • ${prong.quantity}x Prong (${escapeHtml(displaySize)})\n`;
      });
      message += `\n`;
    }
    
    message += `💰 <b>Pricing Breakdown:</b>\n`;
    message += `  Letters: $${pricingBreakdown.lettersSubtotal.toFixed(2)}\n`;
    message += `  Hardware: $${pricingBreakdown.hardwareTotal.toFixed(2)}\n`;
    message += `  Assembly: $${pricingBreakdown.assemblyFee.toFixed(2)}\n`;
    message += `  Shipping: $${pricingBreakdown.shipping.toFixed(2)}\n\n`;
    
    if (order.addressLine1 && order.city && order.stateOrProvinceCode) {
      message += `📍 <b>Address:</b>\n`;
      message += `${escapeHtml(order.addressLine1)}\n`;
      if (order.addressLine2) message += `${escapeHtml(order.addressLine2)}\n`;
      message += `${escapeHtml(order.city)}, ${escapeHtml(order.stateOrProvinceCode)} ${escapeHtml(order.postalCode || '')}\n\n`;
    }
    
    if (order.phoneNumber) {
      message += `📱 <b>Phone:</b> ${escapeHtml(order.phoneNumber)}\n\n`;
    }
    
    if (order.details) {
      message += `📝 <b>Notes:</b> ${escapeHtml(order.details)}\n`;
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    console.log('✅ Telegram notification sent successfully!');
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    throw error;
  }
}

export async function notifyCashAppPayment(order: Order, pricingBreakdown: PricingBreakdown): Promise<void> {
  return sendTelegramNotification(order, pricingBreakdown, 'Cash App');
}

export async function sendTrackingEmail(order: Order, trackingNumber: string, carrierCode: string): Promise<{ success: boolean; message: string }> {
  console.log(`📧 Tracking email for order ${order.orderId || order.id}: ${trackingNumber} (${carrierCode})`);
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
  return { success: true, message: 'Email sending not yet implemented' };
}

// Send a single file to Telegram using base64 data
async function sendFileToTelegram(
  botToken: string,
  chatId: string,
  attachment: Attachment,
  caption: string
): Promise<void> {
  // Convert base64 to Uint8Array
  const binaryString = atob(attachment.data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: attachment.type });

  const isImage = attachment.type.startsWith('image/');
  const endpoint = isImage ? 'sendPhoto' : 'sendDocument';
  const fieldName = isImage ? 'photo' : 'document';

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append(fieldName, blob, attachment.name);
  form.append('caption', caption);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
    method: 'POST',
    body: form,
  });

  const result = await response.json();
  if (!response.ok) {
    console.error(`❌ Failed to send ${fieldName} to Telegram:`, result);
    throw new Error(`Telegram ${endpoint} error: ${result.description}`);
  }
  console.log(`✅ Sent ${fieldName} "${attachment.name}" to Telegram`);
}

// Contact form Telegram notification with optional file attachments
export async function sendContactFormToTelegram(
  firstName: string,
  lastName: string,
  email: string,
  phone: string | undefined,
  subject: string,
  message: string,
  attachments: Attachment[] = []
): Promise<void> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram bot token or chat ID not configured.');
      throw new Error('Telegram not configured');
    }

    // Build text message
    let telegramMessage = `💬 <b>NEW CONTACT FORM MESSAGE</b>\n\n`;
    telegramMessage += `👤 <b>Name:</b> ${escapeHtml(firstName)} ${escapeHtml(lastName)}\n`;
    telegramMessage += `📧 <b>Email:</b> ${escapeHtml(email)}\n`;
    if (phone) telegramMessage += `📱 <b>Phone:</b> ${escapeHtml(phone)}\n`;
    telegramMessage += `\n📋 <b>Subject:</b> ${escapeHtml(subject)}\n\n`;
    telegramMessage += `💭 <b>Message:</b>\n${escapeHtml(message)}`;
    if (attachments.length > 0) {
      telegramMessage += `\n\n📎 <b>${attachments.length} attachment${attachments.length > 1 ? 's' : ''} below</b>`;
    }

    // Send the text message first
    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: telegramMessage, parse_mode: 'HTML' })
    });

    const textResult = await textResponse.json();
    if (!textResponse.ok) throw new Error(`Telegram API error: ${textResult.description}`);
    console.log('✅ Contact form text sent to Telegram');

    // Send each attachment individually
    for (const attachment of attachments) {
      try {
        const caption = `📎 ${attachment.name} (from ${firstName} ${lastName} — ${email})`;
        await sendFileToTelegram(botToken, chatId, attachment, caption);
      } catch (fileError) {
        // Log but don't fail the whole submission if one file fails
        console.error(`⚠️ Failed to send attachment "${attachment.name}":`, fileError);
      }
    }

    console.log('✅ Contact form + all attachments sent to Telegram successfully!');
  } catch (error) {
    console.error('❌ Error sending contact form to Telegram:', error);
    throw error;
  }
}
