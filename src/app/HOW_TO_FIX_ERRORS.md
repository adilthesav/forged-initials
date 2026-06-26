# 🚑 How to Fix "Failed to Fetch" Errors - Quick Start Guide

## 🎯 Getting this Error?

```
Test error: TypeError: Failed to fetch
```

**Don't panic!** This is easy to fix. Follow these steps:

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Open the Fix Tool
1. Go to your **Owner Panel** (Test page)
2. Look for the **big red banner** at the top
3. Click the **"🔬 FIX NOW"** tab

### Step 2: Run the Diagnostic
1. Click the big button: **"🚀 Run Complete Diagnostic"**
2. Wait 10 seconds while it tests everything
3. Read the results

### Step 3: Follow the Instructions
The tool will tell you EXACTLY what to do. It's usually one of these:

---

## 🔧 Common Fixes

### Fix #1: Function Not Deployed ⚠️

**You'll see**: All tests fail with red X marks

**Solution**:
```bash
supabase functions deploy server
```

**How to do it**:
1. Open your terminal
2. Navigate to your project folder
3. Copy the command above
4. Paste and press Enter
5. Wait for deployment to complete
6. Run the diagnostic again

---

### Fix #2: Discord Secret Missing 🔗

**You'll see**: Discord tests fail, others pass

**Solution**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → Edge Functions → Secrets
3. Click "Add Secret"
4. Name: `DISCORD_WEBHOOK_URL`
5. Value: Your Discord webhook URL
6. Save
7. Run in terminal: `supabase functions deploy server`

---

### Fix #3: Stripe Secret Missing 💳

**You'll see**: Payment initialization errors

**Solution**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → Edge Functions → Secrets
3. Click "Add Secret"
4. Name: `STRIPE_SECRET_KEY`
5. Value: Your Stripe API key (starts with `sk_`)
6. Save
7. Run in terminal: `supabase functions deploy server`

---

## ✅ How to Know It's Fixed

You'll see:
- ✅ Green checkmarks on all tests
- ✅ "ALL TESTS PASSED!" message
- ✅ Status indicator shows "All Systems Operational"

---

## 📱 Visual Guide

### Before (Error State)
```
❌ Health Check - Failed to fetch
❌ Environment Check - Failed to fetch
❌ Discord Test - Failed to fetch
❌ Notification Test - Failed to fetch

→ Problem: Function not deployed
→ Solution: supabase functions deploy server
```

### After (Working State)
```
✅ Health Check - Success (123ms)
✅ Environment Check - Success (145ms)
✅ Discord Test - Success (234ms)
✅ Notification Test - Success (189ms)

→ Status: All systems operational!
```

---

## 🎓 Understanding the Errors

### "Failed to fetch" means:
- The endpoint doesn't exist
- Usually = function not deployed
- Easy fix = just deploy it!

### "HTTP 404" means:
- Function exists but endpoint missing
- Usually = incomplete deployment
- Fix = redeploy with all files

### "HTTP 500" means:
- Function exists but has an error
- Usually = missing configuration
- Fix = add required secrets

---

## 🚀 Prevention Tips

### Always Remember:
1. **Deploy via CLI** (not manual copy-paste)
2. **Add secrets BEFORE testing**
3. **Redeploy after changing secrets**
4. **Check Dashboard for deployment status**

### Before Testing:
```bash
# 1. Deploy the function
supabase functions deploy server

# 2. Verify it's running
# Visit: https://[your-project].supabase.co/functions/v1/server/health

# 3. Run the diagnostic in Owner Panel
```

---

## 💡 Pro Tips

### Fastest Way to Check Health:
Open this URL in your browser:
```
https://[your-project-id].supabase.co/functions/v1/server/health
```

**Should see**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "version": "2.1"
}
```

### If You See Nothing:
- Function is not deployed
- Run: `supabase functions deploy server`

---

## 📞 Still Stuck?

### Debug Checklist:
- [ ] Supabase CLI installed? (`npm install -g supabase`)
- [ ] Project linked? (`supabase link`)
- [ ] Function deployed? (`supabase functions deploy server`)
- [ ] Secrets added? (Check Dashboard → Edge Functions → Secrets)
- [ ] Redeployed after adding secrets?

### Where to Look:
1. **Browser Console** (F12 → Console) - Frontend errors
2. **Supabase Logs** (`supabase functions logs server`) - Backend errors
3. **Diagnostic Results** (Show Technical Details) - Complete info
4. **Dashboard** (Supabase.com → Edge Functions) - Deployment status

---

## 🎯 Summary

1. **Run the diagnostic** - It will tell you what's wrong
2. **Follow the instructions** - Copy-paste the commands
3. **Verify success** - All tests should pass
4. **Start accepting orders** - You're ready!

**The diagnostic tool does the hard work for you!** 🎉

---

## 📋 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| All tests fail | `supabase functions deploy server` |
| Discord test fails | Add `DISCORD_WEBHOOK_URL` secret + redeploy |
| Payment fails | Add `STRIPE_SECRET_KEY` secret + redeploy |
| Some tests fail | Redeploy: `supabase functions deploy server` |

---

**Need more help?** Check `/ERROR_FIX_SUMMARY.md` for detailed explanations.

**Want technical details?** See `/FIXES_APPLIED.md` for complete documentation.

---

*You've got this! The diagnostic makes it easy.* 💪
