// Simple Discord Notification Function - No template literals!
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Get Discord webhook URL from environment
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Discord webhook URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the incoming order data
    const orderData = await req.json();
    const { customerName, email, items, total, orderId, paymentMethod, bailOptions, prongsOptions, extraJumpRings } = orderData;

    // Build items list (no template literals!)
    let itemsList = '';
    
    // Add letters
    if (items && items.length > 0) {
      itemsList = itemsList + '**LETTERS:**\n';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        itemsList = itemsList + item.quantity + 'x ' + item.letter + ' (' + item.size + ')';
        if (i < items.length - 1) {
          itemsList = itemsList + '\n';
        }
      }
    }
    
    // Add bails
    if (bailOptions && bailOptions.length > 0) {
      if (itemsList) itemsList = itemsList + '\n\n';
      itemsList = itemsList + '**BAILS:**\n';
      for (let i = 0; i < bailOptions.length; i++) {
        const bail = bailOptions[i];
        itemsList = itemsList + bail.quantity + 'x Size ' + bail.size.toUpperCase();
        if (bail.price) {
          itemsList = itemsList + ' ($' + bail.price.toFixed(2) + ' each)';
        }
        if (i < bailOptions.length - 1) {
          itemsList = itemsList + '\n';
        }
      }
    }
    
    // Add prongs
    if (prongsOptions && prongsOptions.length > 0) {
      if (itemsList) itemsList = itemsList + '\n\n';
      itemsList = itemsList + '**PRONGS:**\n';
      for (let i = 0; i < prongsOptions.length; i++) {
        const prong = prongsOptions[i];
        itemsList = itemsList + prong.quantity + 'x Size ' + prong.size.toUpperCase();
        if (prong.price) {
          itemsList = itemsList + ' ($' + prong.price.toFixed(2) + ' each)';
        }
        if (i < prongsOptions.length - 1) {
          itemsList = itemsList + '\n';
        }
      }
    }
    
    // Add jump rings
    if (extraJumpRings && extraJumpRings > 0) {
      if (itemsList) itemsList = itemsList + '\n\n';
      itemsList = itemsList + '**JUMP RINGS:**\n' + extraJumpRings + ' rings';
    }
    
    if (!itemsList) {
      itemsList = 'No items';
    }

    // Create Discord embed
    const discordPayload = {
      embeds: [{
        title: '💎 New Jewelry Order!',
        color: 3066993, // Green color
        fields: [
          { name: '📦 Order ID', value: orderId || 'N/A', inline: true },
          { name: '💳 Payment', value: paymentMethod || 'Unknown', inline: true },
          { name: '👤 Customer', value: customerName || 'Unknown', inline: false },
          { name: '📧 Email', value: email || 'Unknown', inline: false },
          { name: '🔤 Items', value: itemsList || 'No items', inline: false },
          { name: '💰 Total', value: '$' + (total || '0.00'), inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Forged Initials Order System' }
      }]
    };

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error('Discord API returned ' + response.status);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Discord notification sent!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification: ' + (error.message || 'Unknown error') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});