# 🚀 DEPLOY COMMANDS - Copy and Run

## 1️⃣ First Time Setup (If you haven't logged in):

```bash
# Install Supabase CLI (choose one):
npm install -g supabase          # Using npm
brew install supabase/tap/supabase   # Using Homebrew (Mac)

# Login to Supabase
supabase login
```

---

## 2️⃣ Deploy the Edge Function:

```bash
# Navigate to your project folder first, then:
supabase functions deploy server
```

**Expected Output:**
```
Deploying Function server...
Bundled server (xxx KB)
Deployed Function server in xx.xxs
```

---

## 3️⃣ Verify Deployment:

### Test in Browser:
Open this URL:
```
https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health
```

### Or test in terminal:
```bash
curl https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-11-10T...","version":"2.1"}
```

---

## 4️⃣ Add Discord Webhook Secret:

### Via CLI:
```bash
supabase secrets set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta
```

### Via Dashboard:
1. Go to: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/settings/functions
2. Click "Secrets" tab
3. Add new secret:
   - Name: `DISCORD_WEBHOOK_URL`
   - Value: `https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta`

---

## 5️⃣ Redeploy After Adding Secret:

```bash
supabase functions deploy server
```

**CRITICAL:** You MUST redeploy after adding secrets!

---

## 6️⃣ Test Discord Integration:

### Via your website:
1. Go to Testing Dashboard
2. Click "🚀 Setup" tab
3. Run the instant diagnostic
4. If green ✅, proceed to test Discord notification

### Via API:
```bash
curl -X POST https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/discord/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4" \
  -H "Content-Type: application/json"
```

---

## 🆘 Troubleshooting:

### Error: "supabase: command not found"
**Fix:** Install Supabase CLI (see step 1)

### Error: "Not logged in"
**Fix:** Run `supabase login`

### Error: "No project found"
**Fix:** Make sure you're in the project folder

### Error: "Failed to deploy"
**Fix:** Check if you have write permissions and internet connection

### Still getting "Failed to fetch"?
**This means the function is NOT deployed yet.** Go back to step 2 and deploy it.

---

## ✅ Success Checklist:

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Edge Function deployed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Discord webhook secret added
- [ ] Function redeployed after adding secret
- [ ] Test notification sent successfully
- [ ] Discord embed received

---

## 📋 Quick Reference:

**Your Project ID:** `vpxuizymtmcnsgmpnhel`

**Health Endpoint:** `https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health`

**Debug Endpoint:** `https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/debug-env`

**Discord Test Endpoint:** `https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/discord/test`

---

## 🎯 One-Line Deploy (For Quick Redeploys):

```bash
supabase functions deploy server && echo "✅ Deployed! Test at: https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/health"
```
