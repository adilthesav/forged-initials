# Edge Function Deployment Guide

## Issue Fixed
The checkout session error was caused by `.tsx` files being executed instead of the correct `.ts` files in your Edge Function. These problematic files have been removed.

## Deployment Required
The Edge Function needs to be redeployed to Supabase with the corrected code.

## Deployment Steps

### Option 1: Supabase Dashboard (Recommended for quick fix)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel
2. Navigate to **Edge Functions** in the left sidebar
3. Find the **"server"** function
4. Click **"Edit Function"** or **"Deploy"**
5. Upload/paste the contents from these files in the correct order:
   - `supabase/functions/server/index.ts` (main file)
   - `supabase/functions/server/payments.ts`
   - `supabase/functions/server/notifications.ts`
   - `supabase/functions/server/shipping.ts`
   - `supabase/functions/server/kv_store.ts`
   - `supabase/functions/server/deno.json` (config)
6. Click **Deploy**

### Option 2: Using Supabase CLI (if available locally)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref vpxuizymtmcnsgmpnhel

# Deploy the Edge Function
supabase functions deploy server
```

## Files Location
The corrected Edge Function files are now in:
- `/workspaces/default/code/supabase/functions/server/`

## What Was Fixed
- Removed `index.tsx` (was throwing an error)
- Removed `kv_store.tsx` (duplicate)
- Removed backup and temporary files
- Kept only the correct `.ts` files

## Verify Deployment
After deployment, test the function:
1. Try creating a checkout session from your app
2. Or test the health endpoint: `https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health`

## Environment Variables Required
Make sure these are set in your Supabase project settings:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (optional, for webhooks)
- `FEDEX_CLIENT_ID` (optional, for shipping)
- `FEDEX_CLIENT_SECRET` (optional, for shipping)
- `TELEGRAM_BOT_TOKEN` (optional, for notifications)
- `TELEGRAM_CHAT_ID` (optional, for notifications)
- `ADMIN_PASSWORD` (optional, defaults to: forgedadmin2026)
