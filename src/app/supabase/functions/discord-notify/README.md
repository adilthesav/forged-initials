# Discord Notify Function ✅ DEPLOYED & WORKING!

Simple Discord notification function for Forged Initials orders.

## ✅ Status: DEPLOYED!

This function is **already deployed** and working!

## 🧪 How to Test

**EASY WAY (Use the Website):**

1. Open your website
2. Press F12 and type: `localStorage.setItem('forged_owner_mode', 'enabled')`
3. Refresh the page
4. Look for "Admin Tools" panel in the bottom right corner
5. Click **"Test Discord"** button
6. Check your Discord channel!

**TERMINAL WAY (cURL):**

```bash
curl -X POST https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/discord-notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4" \
  -d '{
    "orderId": "TEST-'$(date +%s)'",
    "customerName": "Test Customer",
    "email": "test@example.com",
    "paymentMethod": "Test",
    "total": "42.00",
    "items": [
      {"letter": "A", "quantity": 1, "size": "Medium"},
      {"letter": "D", "quantity": 1, "size": "Medium"},
      {"letter": "I", "quantity": 1, "size": "Medium"},
      {"letter": "L", "quantity": 1, "size": "Medium"}
    ]
  }'
```

## 🔧 Environment Variables

Already configured in Supabase Dashboard → Edge Functions → Secrets:

- `DISCORD_WEBHOOK_URL` - Your Discord webhook URL ✅

## 📦 Usage in Your Code

```javascript
const response = await fetch(
  'https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/discord-notify',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ANON_KEY',
    },
    body: JSON.stringify({
      orderId: 'ORDER-123',
      customerName: 'John Doe',
      email: 'john@example.com',
      paymentMethod: 'Stripe',
      total: '42.00',
      items: [
        { letter: 'A', quantity: 1, size: 'Medium' }
      ]
    }),
  }
);
```

## 📊 Response

Success:
```json
{
  "success": true,
  "message": "Discord notification sent!"
}
```

Error:
```json
{
  "error": "Error message here"
}
```

## 🎨 What the Discord Message Looks Like

Beautiful **green embed** with:
- 💎 Title: "New Jewelry Order!"
- 📦 Order ID
- 💳 Payment method
- 👤 Customer name
- 📧 Email
- 🔤 Items list
- 💰 Total amount
- ⏰ Timestamp

## 🔄 Re-deploy (if needed)

```bash
supabase functions deploy discord-notify --project-ref vpxuizymtmcnsgmpnhel
```

---

**Need help?** Check `/TEST_DISCORD_NOW.md` in the root folder!
