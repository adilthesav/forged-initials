# 🚀 COMPLETE DEPLOYMENT CHECKLIST - Discord & Stripe Integration

## ✅ COMPLETED

1. ✅ Fixed all `.tsx` imports to `.ts` in `index.ts`
2. ✅ Removed all template literals (`${}`) from `index.ts`
3. ✅ Created `kv_store.ts` (converted from .tsx)

## ❌ CRITICAL REMAINING TASKS

### **TASK 1: Convert ALL `.tsx` files to `.ts` in `/supabase/functions/server/`**

You need to manually convert template literals in these files:

#### **File: payments.tsx → payments.ts**
- [ ] Line 2: Change `import * as kv from './kv_store.tsx';` → `'./kv_store.ts';`
- [ ] Line 5: Change `import { ... } from './shipping.tsx';` → `'./shipping.ts';`
- [ ] Line 24: Change `` `❌ Invalid Stripe key format detected. Key should start with 'sk_test_' or 'sk_live_'. Received: ${key.substring(0, 10)}...` `` → `'... Received: ' + key.substring(0, 10) + '...'`
- [ ] Line 156: Change `` `Unsupported material: ${material}. Using sterling-silver pricing.` `` → `'Unsupported material: ' + material + '. Using sterling-silver pricing.'`
- [ ] Line 252: Same as 156
- [ ] Line 365: Change `` `ORDER-${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}` `` → `'ORDER-' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase()`
- [ ] Line 384: Complex template - convert to string concatenation
- [ ] Lines 403-404: Change `` `order:${order.id}` `` → `'order:' + order.id`
- [ ] Line 448: Same as 365
- [ ] Lines 506-509: Same pattern
- [ ] Lines 538, 541, 545, 563: Same pattern
- [ ] **FIND ALL** template literals using search: `` ` `` (backtick) and `${` 

#### **File: shipping.tsx → shipping.ts**
- [ ] Convert ALL template literals
- [ ] Fix ALL `.tsx` imports to `.ts`

#### **File: notifications.tsx → notifications.ts**
- [ ] Convert ALL template literals
- [ ] Fix ALL `.tsx` imports to `.ts`

### **TASK 2: Delete OLD `.tsx` Files After Converting**

After you create the `.ts` versions, delete these:
- [ ] `/supabase/functions/server/kv_store.tsx`
- [ ] `/supabase/functions/server/payments.tsx`
- [ ] `/supabase/functions/server/shipping.tsx`
- [ ] `/supabase/functions/server/notifications.tsx`
- [ ] `/supabase/functions/server/index.tsx`

### **TASK 3: Verify Environment Variables in Supabase**

Go to Supabase Dashboard → Edge Functions → Secrets and verify:

#### **Discord (Required for notifications)**
- [ ] `DISCORD_WEBHOOK_URL` - Your Discord webhook URL

#### **Stripe (Required for payments)**
- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_test_... or sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret

#### **Supabase (Auto-configured)**
- [ ] `SUPABASE_URL` - Already set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Already set
- [ ] `SUPABASE_ANON_KEY` - Already set

#### **Optional (for emails)**
- [ ] `RESEND_API_KEY` - If you want email notifications
- [ ] `OWNER_EMAIL` - Your email for order notifications

#### **Optional (for FedEx shipping)**
- [ ] `FEDEX_CLIENT_ID`
- [ ] `FEDEX_CLIENT_SECRET`
- [ ] `FEDEX_ACCOUNT_NUMBER`
- [ ] `FEDEX_USE_SANDBOX` - Set to `true` for testing

### **TASK 4: Deploy to Supabase**

After converting ALL files:

```bash
# Navigate to project root
cd /path/to/your/project

# Deploy the Edge Function
supabase functions deploy server --project-ref vpxuizymtmcnsgmpnhel
```

### **TASK 5: Test the Deployment**

#### **Test Discord Notifications**
```bash
# Test Discord webhook configuration
curl https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/discord/check-webhook \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Send test notification
curl -X POST https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/discord/send-test \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### **Test Stripe Integration**
```bash
# Check health
curl https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test price calculation
curl -X POST https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/get-price \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "material": "sterling-silver",
    "items": [{"letter": "A", "quantity": 1, "size": "medium"}],
    "pendantStyle": "none",
    "bailOptions": [],
    "extraJumpRings": 0,
    "prongsOptions": []
  }'
```

## 🎯 QUICK CONVERSION SCRIPT

You can use this VS Code Find & Replace (Cmd+Shift+H or Ctrl+Shift+H):

### **Find Pattern 1: Simple template strings**
- **Find:** `` `([^`]*)\$\{([^}]+)\}([^`]*)` ``
- **Replace:** `'$1' + $2 + '$3'`
- **Enable:** Regex

### **Find Pattern 2: Backticks only (find manually)**
- **Find:** `` ` ``
- Review each one and convert manually

## 📊 CONVERSION STATUS

### Files Converted:
- ✅ `/supabase/functions/server/index.ts` - DONE
- ✅ `/supabase/functions/server/kv_store.ts` - DONE

### Files Pending:
- ❌ `/supabase/functions/server/payments.tsx` → payments.ts
- ❌ `/supabase/functions/server/shipping.tsx` → shipping.ts  
- ❌ `/supabase/functions/server/notifications.tsx` → notifications.ts

## 🔥 CRITICAL NOTES

1. **Deno Does NOT Support Template Literals in Edge Functions** - This is why we're converting
2. **ALL `.tsx` files must become `.ts`** - No React syntax in server code
3. **Test locally first** using `supabase functions serve server`
4. **Check Supabase logs** after deployment: Dashboard → Edge Functions → Logs

## 📝 AFTER DEPLOYMENT

Once deployed and tested, you should be able to:

1. ✅ Receive Discord notifications for new orders (beautiful green embeds)
2. ✅ Process Stripe payments via the web app
3. ✅ Auto-generate Order IDs like `ORDER-1234567ABCD`
4. ✅ Store orders in Supabase database
5. ✅ Send test notifications via `/discord/send-test` endpoint

## 🆘 IF DEPLOYMENT FAILS

1. Check Supabase Edge Function logs for errors
2. Verify NO template literals remain (search for backticks)
3. Verify ALL imports use `.ts` not `.tsx`
4. Make sure `deno.json` exists in `/supabase/functions/server/`
5. Check that all environment variables are set in Supabase Dashboard

---

**Next Step:** Convert `payments.tsx`, `shipping.tsx`, and `notifications.tsx` to `.ts` files by replacing ALL template literals with string concatenation.
