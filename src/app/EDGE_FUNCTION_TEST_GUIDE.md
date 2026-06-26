# Edge Function Connection Test Guide

## What's Happening?

All diagnostic tests are showing "NETWORK ERROR - Endpoint not reachable". This means the automated tests cannot connect to your Edge Function.

## Quick Test Steps

### 1. **Browser Test (Simplest)**
Go to the "🔬 FIX NOW" tab in the Owner Panel and use the **Quick Connection Test**.

Click "Open in Browser" or visit this URL directly:
```
https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health
```

**What You Should See:**

✅ **If Working:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "version": "2.1"
}
```

❌ **If NOT Working:**
- "Function not found" error page
- Connection timeout
- CORS error
- 404 error

### 2. **Check Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/functions
2. Look for a function named **"server"**
3. Check the status:
   - ✅ Green "Active" badge = Deployed
   - ❌ No function listed = Not deployed
   - ⚠️ Error badge = Deployment failed

### 3. **Check Function Logs**

1. In the Supabase Dashboard, click on the "server" function
2. Go to the **"Logs"** tab
3. Look for error messages (especially red text)
4. Common errors:
   - Module import failures
   - Missing dependencies
   - Syntax errors
   - Missing environment variables

### 4. **Check Browser Console**

1. Press **F12** to open DevTools
2. Go to the **"Console"** tab
3. Run the diagnostic tests again
4. Look for:
   - CORS errors (red text about "Access-Control-Allow-Origin")
   - Network errors
   - Failed fetch errors

## Common Issues & Solutions

### Issue: "Function not found"
**Solution:** The function is not deployed. Run:
```bash
supabase functions deploy server
```

### Issue: "CORS error"
**Solution:** The function code has CORS configured, but if you see this error:
1. Check the Edge Function logs
2. The function might be crashing during startup
3. Look for import errors in the logs

### Issue: "Request timeout"
**Solution:**
1. The function might be starting up (cold start)
2. Try again after 30 seconds
3. Check the function logs for startup errors

### Issue: "Network Error" or "Failed to fetch"
**Solution:**
1. Check your internet connection
2. Check if Supabase is accessible
3. Try opening https://supabase.com in your browser
4. Check the function logs for errors

## Diagnostic Logging

The updated diagnostic now logs detailed information to the browser console:
- Request method and URL
- Response status and headers
- Response data
- Error details with stack traces

**To see these logs:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run the diagnostic tests
4. Look for logs starting with:
   - 🔍 DIAGNOSTIC:
   - ✅ RESPONSE RECEIVED:
   - ❌ REQUEST FAILED:

## Next Steps

Once you determine if the function is deployed or not:

### If Deployed and Working:
- The issue is likely with specific endpoints or configuration
- Configure Discord webhook URL
- Configure Stripe secrets
- Run the full diagnostic for detailed testing

### If Not Deployed or Failing:
1. Check the Edge Function code for errors
2. Verify all imports are correct
3. Check deno.json configuration
4. Redeploy with: `supabase functions deploy server`
5. Monitor the deployment output for errors

## Getting Help

If you're stuck:
1. Screenshot the browser test results
2. Screenshot the function logs from Supabase Dashboard
3. Screenshot the browser console errors
4. Share these in your support request

The more information you provide, the easier it will be to diagnose the issue!
