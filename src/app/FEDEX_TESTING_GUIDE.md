# FedEx Shipping Integration - Testing & Verification Guide

## 🎯 How to Verify Your FedEx Integration Works

Your Forged Initials website has a comprehensive FedEx shipping integration with **3 modes of operation**:

### 1. **Production Mode** (Real FedEx API)
- Creates real shipping labels
- Charges your FedEx account
- Use for live customer orders
- Set: `FEDEX_USE_SANDBOX=false` and `FEDEX_USE_MOCK=false`

### 2. **Sandbox Mode** (FedEx Test API)
- Creates test shipping labels
- No charges
- Perfect for testing
- Set: `FEDEX_USE_SANDBOX=true` and `FEDEX_USE_MOCK=false`

### 3. **Mock Mode** (No API Calls)
- Simulates shipping without any FedEx API calls
- No credentials needed
- Perfect for development
- Set: `FEDEX_USE_MOCK=true`

---

## 🧪 Testing Methods

### Method 1: FedEx Testing Dashboard (RECOMMENDED)

1. **Access the Dashboard:**
   - Click copyright text 5 times to enable Owner Mode
   - Click "Testing Dashboard" button
   - Go to "Ship" tab

2. **Run Tests:**
   - Click "Run All Tests" button
   - Tests will verify:
     - ✅ Server configuration
     - ✅ FedEx authentication
     - ✅ Address validation (Houston-only)
     - ✅ Label generation
     - ✅ Tracking system
     - ✅ Full integration flow

3. **Review Results:**
   - ✅ Green = Working correctly
   - ❌ Red = Needs fixing
   - 🔵 Running = Test in progress
   - Each test shows detailed error messages and troubleshooting tips

### Method 2: Customer Tracking Portal

1. **Make a Test Order:**
   - Go through checkout with a test order
   - Use Houston address only
   - Complete payment

2. **Track the Order:**
   - Visit `/track` or click "Track Order" in header
   - Enter your order number
   - View shipment status and tracking details

### Method 3: Server Logs

Check your Supabase Edge Function logs:

1. Go to Supabase Dashboard → Edge Functions → Logs
2. Look for these indicators:
   ```
   ✅ FedEx authentication successful
   📦 FedEx shipment created for order
   ```

---

## 🔍 What Each Test Verifies

### 1. FedEx API Credentials Test
**What it checks:**
- Are credentials configured?
- Can authenticate with FedEx?
- Correct environment (Sandbox vs Production)?

**Passes if:** Successfully gets OAuth access token from FedEx API

**Common failures:**
- "FedEx authentication failed" = Wrong environment or invalid credentials
- "FedEx credentials not configured" = Missing environment variables
- Fix: Check credentials match environment in Supabase Dashboard

### 2. Shipping Label Generation Test
**What it checks:**
- Can create actual shipping labels?
- Package weight calculation
- Label PDF generation

**Passes if:** Returns tracking number and label URL

**Common failures:**
- "Label generation failed" = API error or invalid shipping details
- Fix: Check FedEx account has Ship API enabled

### 3. Houston Address Validation Test
**What it checks:**
- Valid Houston addresses pass ✅
- Non-Houston addresses blocked ❌

**Passes if:** Houston address succeeds AND Dallas address fails

**Common failures:**
- Both pass = Validation not working
- Both fail = FedEx API issue

### 4. Tracking System Test
**What it checks:**
- Can store shipment details?
- Can retrieve shipment by order ID?
- Tracking portal works?

**Passes if:** Creates shipment and retrieves it successfully

### 5. Full Integration Test
**What it checks:**
- Complete order flow
- Order creation → Shipment → Tracking
- All systems working together

**Passes if:** All 3 steps succeed in sequence

---

## 🚨 Troubleshooting

### Problem: Authentication Failed

**Symptoms:**
```
FedEx authentication failed: FORBIDDEN.ERROR
```

**Most Likely Fix:**
Your credentials are for the wrong environment!

- If using Sandbox credentials: Set `FEDEX_USE_SANDBOX=true`
- If using Production credentials: Set `FEDEX_USE_SANDBOX=false`

**Check in Supabase:**
1. Dashboard → Settings → Edge Functions → Environment Variables
2. Verify:
   - `FEDEX_CLIENT_ID` matches environment
   - `FEDEX_CLIENT_SECRET` matches environment
   - `FEDEX_ACCOUNT_NUMBER` is correct
   - `FEDEX_USE_SANDBOX` is set correctly

### Problem: Mock Mode Always Running

**Symptoms:**
Tracking numbers start with "MOCK" even with credentials configured

**Fix:**
Set `FEDEX_USE_MOCK=false` in Supabase environment variables

### Problem: Houston Validation Not Working

**Symptoms:**
Non-Houston addresses not being rejected

**Fix:**
Check shipping.ts line 154-156 - Houston validation logic should be:
```typescript
if (state !== 'TX' || city !== 'houston') {
  throw new Error('We currently only ship to Houston, Texas');
}
```

### Problem: Auto-Fallback to Mock

**Symptoms:**
System automatically uses mock mode even with valid credentials

**This is a FEATURE!**
- System falls back to mock mode if FedEx API fails
- Orders still process successfully
- You'll need to manually create labels
- Fix the credentials to use real API

---

## 📊 Understanding Test Results

### All Tests Pass ✅
Your FedEx integration is **fully operational**:
- Real shipping labels will be created
- Tracking works correctly
- Houston validation active
- Ready for production use

### Some Tests Fail ❌
**Partial functionality:**
- Mock mode will be used as fallback
- Orders still process
- Manual label creation needed
- Fix failing tests for full automation

### All Tests Fail ❌
**Mock mode only:**
- System runs in mock mode
- No real shipping labels
- All orders need manual fulfillment
- Check credentials and environment settings

---

## 🎯 Quick Verification Checklist

Before going live, verify:

- [ ] FedEx Authentication Test passes
- [ ] Label Generation Test passes  
- [ ] Houston Validation Test passes
- [ ] Tracking System Test passes
- [ ] Full Integration Test passes
- [ ] Test order completes end-to-end
- [ ] Tracking portal shows correct info
- [ ] Environment matches credentials (Sandbox/Production)
- [ ] FEDEX_USE_MOCK is false (unless intentional)
- [ ] FedEx account has sufficient funds/credits

---

## 🚀 Going to Production

### Switch from Sandbox to Production:

1. **Get Production Credentials:**
   - FedEx Developer Portal → Production Project
   - Generate API Key & Secret
   - Get Production Account Number

2. **Update Environment Variables:**
   ```
   FEDEX_CLIENT_ID = <production_key>
   FEDEX_CLIENT_SECRET = <production_secret>
   FEDEX_ACCOUNT_NUMBER = <production_account>
   FEDEX_USE_SANDBOX = false
   FEDEX_USE_MOCK = false
   ```

3. **Test Again:**
   - Run all tests in Testing Dashboard
   - Verify all pass with production credentials
   - Make one real test shipment

4. **Monitor:**
   - Check Supabase logs for any errors
   - Verify labels are being created
   - Test tracking portal with real orders

---

## 📞 Need Help?

### Resources:
- **Testing Dashboard:** Click copyright 5x → Testing → Ship tab
- **Tracking Portal:** Header → "Track Order"
- **Server Logs:** Supabase Dashboard → Edge Functions → Logs
- **FedEx Developer Portal:** https://developer.fedex.com

### Common Questions:

**Q: Can I test without FedEx credentials?**
A: Yes! Set `FEDEX_USE_MOCK=true` for full simulation

**Q: Will orders fail if FedEx is down?**
A: No! Auto-fallback to mock mode keeps orders processing

**Q: How do I know which mode I'm in?**
A: Check server logs or run FedEx Authentication Test

**Q: Can I ship outside Houston?**
A: Currently no - Houston-only validation is hardcoded

---

## 🎉 Success Indicators

Your FedEx integration is working when you see:

1. ✅ All dashboard tests pass
2. 📦 Real tracking numbers (not "MOCK...")
3. 🏷️ Downloadable PDF labels
4. 🚚 Tracking portal shows shipment details
5. 📱 Telegram notifications include tracking info
6. ⚡ No fallback warnings in logs

**Congratulations!** Your automated shipping is fully operational! 🎊
