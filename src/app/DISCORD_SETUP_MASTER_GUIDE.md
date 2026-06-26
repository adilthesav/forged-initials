# 🎯 DISCORD SETUP - COMPLETE MASTER GUIDE

**Last Updated:** November 10, 2025  
**Status:** Ready to Deploy  
**Estimated Time:** 5-10 minutes

---

## 📋 QUICK START (Do This First!)

### **Step 1: Go to Your Website**
1. Open your Forged Initials website
2. Enable Owner Mode (password: `ForgedInitials2024`)
3. Click **"Testing Dashboard"**
4. Click **"🚀 Setup"** tab

### **Step 2: Run the Emergency Test**
- Look for the big red box: **"🚨 EMERGENCY DIAGNOSTIC TEST"**
- Click: **"🔍 RUN EMERGENCY TEST NOW"**
- Wait 5 seconds for results

### **Step 3: Follow the Instructions**
The test will tell you **EXACTLY** what to do:
- ✅ If everything works → You're done! Check Discord!
- ❌ If something's wrong → Clear fix instructions with copy-paste commands

---

## 🎓 HOW TO COPY COMMANDS

**Your browser blocks auto-copy, but manual copy is easy:**

### The Triple-Click Method ⚡
1. **Triple-click** (3 fast clicks) on any black box
2. Press `Ctrl+C` (Windows) or `Cmd+C` (Mac)
3. Paste in terminal with `Ctrl+V` or `Cmd+V`

**That's it!** All black boxes turn green when you hover = ready to copy!

---

## 🔧 LIKELY FIX NEEDED

Based on your setup, you probably need to:

### **Fix: Add Discord Secret**

**Step 1: Add the Secret in Supabase**

1. Go to: https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/settings/functions
2. Click **"Secrets"** tab
3. Click **"Add new secret"** button
4. Enter:
   - **Name:** `DISCORD_WEBHOOK_URL`
   - **Value:** `https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta`
5. Click **"Save"**

**Step 2: Redeploy (CRITICAL!)**

Open your terminal and run:
```bash
supabase functions deploy server
```

**Why redeploy?** The function needs to restart to see the new secret.

---

## ✅ SUCCESS LOOKS LIKE THIS

When working correctly, you'll see:

### In the Emergency Test:
```
🎉 EVERYTHING IS WORKING PERFECTLY!

✅ What's Working:
• Edge Function deployed and running
• Discord webhook secret configured correctly
• Test notification sent successfully
• All future orders will send notifications automatically
```

### In Your Discord Channel:
You'll receive a beautiful green Discord embed with:
- Test order details
- Pricing breakdown
- Customer information
- Order ID

---

## 🆘 TROUBLESHOOTING

### "Function Not Deployed"
**Fix:** Deploy the function first
```bash
supabase functions deploy server
```

### "Secret Not Set"
**Fix:** Follow the "Add Discord Secret" steps above, then redeploy

### "Discord Webhook Invalid"
**Fix:** 
1. Go to Discord → Your Channel → Edit Channel → Integrations → Webhooks
2. Check if webhook still exists
3. If not, create new one and update secret in Supabase
4. Redeploy function

### "Endpoints Not Responding"
**Fix:** Redeploy using CLI (not dashboard copy-paste)
```bash
supabase functions deploy server
```

---

## 📁 PROJECT STRUCTURE

Your Edge Function includes these files:
```
supabase/functions/server/
├── index.tsx           (main router)
├── notifications.tsx   (Discord logic)
├── payments.tsx        (Stripe/Cash App)
├── shipping.tsx        (shipping calculations)
└── kv_store.tsx       (order storage)
```

All files are deployed together when you run:
```bash
supabase functions deploy server
```

---

## 🎯 WHAT HAPPENS NEXT

Once set up correctly:

1. **Customer places order** → Clicks "Complete Payment"
2. **Payment processed** → Stripe or Cash App confirms
3. **Order created** → Stored in Supabase database
4. **Discord notification sent** → Beautiful embed with all details
5. **Success page shown** → Customer sees confirmation

**Fully automatic!** No manual steps required.

---

## 📞 QUICK REFERENCE

**Your Supabase Project:** https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel

**Edge Functions Settings:** https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/settings/functions

**Deploy Command:**
```bash
supabase functions deploy server
```

**Discord Webhook URL:**
```
https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta
```

**Secret Name (must be exact):**
```
DISCORD_WEBHOOK_URL
```

---

## 💡 PRO TIPS

1. **Always redeploy after adding/changing secrets**
2. **Use CLI deployment, not dashboard copy-paste** (ensures all files are included)
3. **Test with the Emergency Test first** before placing real orders
4. **Check Discord channel** after running test to confirm it works

---

## ✨ YOU'VE GOT THIS!

The Emergency Test makes this foolproof:
- ✅ Tests everything automatically
- ✅ Tells you exactly what's wrong
- ✅ Provides copy-paste commands to fix it
- ✅ Confirms when everything works

**Just run the test and follow the instructions!** 🚀

---

## 📝 CHANGE LOG

**Nov 10, 2025:**
- ✅ Discord integration code complete
- ✅ Emergency diagnostic test created
- ✅ All commands pre-written for copy-paste
- ✅ Visual guides added for copying text
- ⏳ Waiting for deployment + secret configuration

---

**Need help?** Run the Emergency Test - it will guide you through everything! 💙
