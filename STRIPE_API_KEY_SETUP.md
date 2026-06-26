# Stripe API Key Setup Guide

## Current Issue
The Edge Function is running, but it can't authenticate with Stripe because the `STRIPE_SECRET_KEY` environment variable is missing or invalid.

## Quick Fix Steps

### Step 1: Get Your Stripe Secret Key

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
2. Find your **Secret key** (starts with `sk_test_` for test mode)
3. Click **"Reveal test key"** and copy it
4. It should look like: `sk_test_51ABC...XYZ`

⚠️ **Important**: 
- Use **Test mode** keys for development
- Use **Live mode** keys for production
- Never commit keys to git

### Step 2: Add the Key to Supabase

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/settings/functions
2. Click on **Edge Functions** settings
3. Scroll to **Secrets** section
4. Add a new secret:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (e.g., `sk_test_51ABC...`)
5. Click **Save**

#### Option B: Via Supabase CLI

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 3: Verify the Setup

After adding the secret, test it by:

1. Opening your app
2. Adding items to cart
3. Clicking "Proceed to Checkout"
4. You should be redirected to Stripe Checkout (no more errors)

## Optional: Additional Stripe Configuration

For full functionality, also add these secrets:

### Webhook Secret (for payment confirmations)
1. In Stripe Dashboard, go to: **Developers → Webhooks**
2. Create endpoint: `https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/stripe-webhook`
3. Copy the **Signing secret** (starts with `whsec_`)
4. Add to Supabase:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...`

## Troubleshooting

### Error: "Invalid API key format"
- Make sure the key starts with `sk_test_` or `sk_live_`
- No extra spaces or quotes
- Copy the entire key

### Error: "Authentication failed"
- The key might be from the wrong Stripe account
- Try regenerating the key in Stripe Dashboard

### Still not working?
1. Check the Edge Function logs in Supabase Dashboard
2. Verify the secret is saved correctly
3. Restart the Edge Function (redeploy if needed)

## Testing Stripe Checkout

Test mode cards that always work:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)
