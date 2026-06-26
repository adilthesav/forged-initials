# ⚡ Forged Initials - Custom Jewelry Business

Professional website for custom handcrafted silver letter jewelry (A-Z).

---

## 🚨 **SETUP REQUIRED - Deploy Your Backend**

If you're seeing **"Cannot connect to Edge Function"** or **"Payment initialization failed"**:

### ⚡ Quick Fix (5 minutes):
```bash
supabase login
supabase link
supabase functions deploy server
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

### 📚 Choose Your Guide:

| Guide | Best For | Time |
|-------|----------|------|
| **[QUICK_START.md](./QUICK_START.md)** ⭐⭐⭐ | Just want commands | 2 min |
| **[START_HERE_DEPLOYMENT.md](./START_HERE_DEPLOYMENT.md)** ⭐⭐⭐ | Overview & links | 5 min |
| **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** | Step-by-step | 10 min |
| **[deploy.sh](./deploy.sh)** | Automated script | 3 min |
| **[DEPLOYMENT_AT_A_GLANCE.md](./DEPLOYMENT_AT_A_GLANCE.md)** | Visual quick ref | 1 min |
| **[All Deployment Docs](./DEPLOYMENT_DOCS_INDEX.md)** | Complete index | - |

✅ **Verify:** Testing Dashboard → 💳 Stripe tab → Run Setup Checks

💡 **Having issues?** See **[STRIPE_QUICK_FIX.md](./STRIPE_QUICK_FIX.md)** for troubleshooting

---

## 🚀 **NEW! Enterprise-Level SEO & Email Solutions**

### 🔍 **Professional SEO** - Google-ready optimization!

**✨ NEW Advanced Features:**
✅ **Schema.org Markup** - Rich snippets in Google search results  
✅ **FAQ Section** - Appears in "People Also Ask"  
✅ **LocalBusiness Schema** - Show in Houston local searches  
✅ **Product Schema** - Pricing & reviews in search  
✅ **Social Share Images** - 1200×630 beautiful previews  
✅ **Canonical URLs** - Prevent duplicate content  

**Previously Added:**
✅ Meta Description (152 chars, perfect!)  
✅ Open Graph Tags (Facebook, LinkedIn)  
✅ Twitter Cards (professional shares)  
✅ Dynamic page-specific SEO  

👉 **Quick Start:** `SEO_MASTER_ROADMAP.md` ⭐⭐⭐  
👉 **Test Now:** `SEO_QUICK_GUIDE.md` ⭐  

### ✉️ **Quick Email Solution** - Send customer emails in 30 seconds!
✉️ **Order Receipts** - Itemized pricing breakdown after payment  
📦 **Shipping Tracking** - FedEx tracking links after shipping  

👉 **See `START_HERE.md`** ⭐⭐⭐ for the simplest way to send professional customer emails!

**SEO Guides:**
- `SEO_MASTER_ROADMAP.md` - Complete roadmap ⭐⭐⭐
- `ADVANCED_SEO_GUIDE.md` - Advanced features explained
- `SEO_QUICK_GUIDE.md` - Quick reference & testing
- `SEO_CHECKLIST.md` - Implementation checklist
- `SITEMAP_AND_ROBOTS.md` - Sitemap & robots.txt guide

**Email Guides:**
- `QUICK_EMAIL_COPY_PASTE.md` - Order receipt guide
- `TRACKING_EMAIL_COPY_PASTE.md` - Shipping tracking guide

---

## 🎯 What This Is

A complete e-commerce website for **Forged Initials** featuring:
- 🌟 **Enterprise-Level SEO** - Schema.org, FAQ, rich snippets, social optimization
- 🛒 Custom multi-letter orders (e.g., A×30, B×42, D×11)
- 💍 925 Sterling Silver jewelry at $3/piece
- 📏 Size multipliers (Small: 0.8×, Medium: 1.0×, Large: 1.3×)
- 💳 Stripe payment processing
- 📊 Automatic order management (Supabase)
- 🔔 Discord notifications
- ✉️ Professional tracking & receipt emails
- ❓ FAQ section with structured data
- 🧪 Testing dashboard for order management

---

## ✅ Current Status

**All core features are working:**
- ✅ **🌟 Enterprise SEO** (Schema.org, FAQ, rich snippets, social media)
- ✅ Stripe payment integration
- ✅ Discord order notifications with **email fallback system**
- ✅ Email tracking system (Resend)
- ✅ Multi-item cart system
- ✅ Order management (Supabase)
- ✅ Testing dashboard
- ✅ **Copy-paste email system** (receipts + tracking)
- ✅ **FAQ section** with structured data
- ⚠️ FedEx shipping (mock mode - optional)

---

## 🚀 Quick Start

### **For Customers:**
1. Visit the website
2. Select letters and quantities
3. Choose size (Small/Medium/Large)
4. Enter shipping address (Houston only)
5. Pay with Stripe
6. Receive confirmation email (automated or manual)
7. Receive tracking email when shipped

### **For You (Admin):**

#### **Open Testing Dashboard:**
1. Scroll to bottom → Click copyright text **5 times rapidly**
2. Admin Tools panel appears (bottom-right)
3. Click **"🧪 Full Testing Dashboard"** (purple button)
4. Page scrolls to top → Dashboard opens

**📖 Detailed Instructions:** See `HOW_TO_OPEN_DASHBOARD.md`

#### **🆕 Simple Email Solution (Recommended!):**
1. Admin Tools → Click **"✉️ Quick Email Generator"** (green button)
2. Choose: **Order Receipt** or **Shipping Tracking**
3. Fill in details:
   - Receipt: Order ID, Items, Address, Pricing
   - Tracking: FedEx Tracking Number, Order ID
4. Click **"Copy Email"** → Paste → Send!

**📖 Complete Guides:** 
- `QUICK_EMAIL_COPY_PASTE.md` - Order receipts ⭐
- `TRACKING_EMAIL_COPY_PASTE.md` - Shipping tracking ⭐

**Time:** 30 seconds per email | **Deployment:** None needed | **Reliability:** 100%

#### **Alternative: Discord Email Backup:**
1. Testing Dashboard → **"📧 Debug"** tab
2. Click **"Run Diagnostic Test"**
3. Check results:
   - ✅ **"Itemized Pricing: Present"** = Working! Check Discord for green embed
   - ❌ **"Itemized Pricing: MISSING"** = See `DEPLOY_EDGE_FUNCTION.md`

#### **Daily Workflow:**
3. **Check Discord** for order notifications
4. **Send receipt emails:** Use Quick Email Generator (30 sec)
5. **Send tracking emails:** Testing Dashboard → Track/Receipt tab
6. **Monitor everything:** Supabase/Stripe/Discord dashboards

---

## 📚 Documentation

### **Start Here:**
- **`SETUP_GUIDE.md`** - Complete system overview & configuration

### **Feature Guides:**
- **`TRACKING_EMAIL_GUIDE.md`** - How to send tracking emails
- **`TRACKING_EMAIL_CUSTOM_ADDRESS.md`** - Override customer emails
- **`ORDER_ID_SYSTEM.md`** - Order ID format & generation

### **Setup:**
- **`NOTIFICATION_SETUP.md`** - Discord configuration
- **`PAYMENT_SETUP.md`** - Stripe setup
- **`FEDEX_SHIPPING_SETUP.md`** - FedEx integration (optional)

### **Testing:**
- **`TESTING_GUIDE.md`** - Complete testing documentation
- **`QUICK_START_TESTING.md`** - Quick testing reference

---

## 🧪 Testing Dashboard

**Access:** Click the copyright text at the bottom of your website **5 times quickly**

**Features:**
- ✅ Check environment configuration
- ✅ Send test Discord notifications
- ✅ Create test orders with full customer info
- ✅ Test shipping integration (or mock mode)
- ✅ Send tracking emails to customers

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase Edge Functions
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Resend
- **Notifications:** Discord Webhooks
- **Shipping:** FedEx API (optional, mock mode available)

---

## 📦 Project Structure

```
├── App.tsx                 # Main application
├── components/             # React components
│   ├── Header.tsx         # Navigation
│   ├── Hero.tsx           # Hero section
│   ├── CustomOrder.tsx    # Order form with cart
│   ├── PaymentForm.tsx    # Stripe checkout
│   ├── TestSystem.tsx     # Testing dashboard
│   └── ui/                # ShadCN UI components
├── supabase/functions/    # Backend Edge Functions
│   └── server/
│       ├── index.tsx      # Main API routes
│       ├── payments.tsx   # Stripe integration
│       ├── notifications.tsx # Discord & Email
│       └── shipping.tsx   # FedEx integration
├── styles/
│   └── globals.css        # Global styles
└── utils/
    └── supabase/
        └── info.tsx       # Supabase config
```

---

## 🔐 Environment Variables

**Location:** Supabase → Edge Functions → Secrets

**Required:**
- `STRIPE_SECRET_KEY` - Stripe API key ✅
- `DISCORD_WEBHOOK_URL` - Discord webhook ✅
- `RESEND_API_KEY` - Email service ✅

**Optional (for FedEx):**
- `FEDEX_API_KEY`
- `FEDEX_SECRET_KEY`
- `FEDEX_ACCOUNT_NUMBER`
- `FEDEX_METER_NUMBER`
- `FEDEX_USE_SANDBOX` (true/false)

---

## 💡 Key Features

### **Email Fallback System (NEW!):**
- **Automated emails** sent via Resend API
- **Discord backup** with ready-to-copy email content
- If automation fails, copy email from Discord → paste → send
- Takes 30 seconds per order
- Ensures customers ALWAYS get confirmations
- See `DISCORD_EMAIL_FALLBACK.md` for details

### **Multi-Item Cart System:**
- Add multiple different letters (A-Z)
- Individual quantities per letter
- Real-time price calculation
- Itemized breakdown
- Example: A×30 ($72) + B×42 ($100.80) + D×11 ($26.40) = $199.20

### **Dynamic Pricing:**
- Base: $3 per piece (925 Sterling Silver)
- Size multipliers: Small (0.8×), Medium (1.0×), Large (1.3×)
- Flat shipping: $10 (FedEx Ground to Houston)

### **Order Management:**
- Automatic order creation
- Discord notifications with full customer details
- Email tracking notifications
- Supabase database storage

### **Testing Dashboard:**
- Test all features without real orders
- Send test emails to yourself
- Verify Discord notifications
- Check environment configuration

---

## 🎯 Common Tasks

### **Send Tracking Email to Customer:**
1. Click copyright 5× → Testing Dashboard
2. Go to "Tracking" tab
3. Enter Order ID (from Discord)
4. Enter FedEx tracking number
5. Optionally add personal message
6. Click "Send Tracking Email"

### **Create Test Order:**
1. Testing Dashboard → "Full Order" tab
2. Click "Test Full Order with Customer Info"
3. **Check Discord for TWO embeds:**
   - Purple embed = Order info (for you)
   - **Green embed = Customer email (copy & paste backup)**
4. Use Order ID for tracking email test

### **Test Email Backup System:**
1. Click "Test Discord" in admin tools
2. **Check Discord for TWO embeds:**
   - 🟣 Purple = Order info
   - 🟢 Green = Customer email (READY TO COPY)
3. Copy the email content from green code block
4. Practice pasting in email (don't send test)
5. **See `TEST_DISCORD_BACKUP.md` for detailed testing guide**

### **Check Configuration:**
1. Testing Dashboard → "Config" tab
2. Click "Check Environment Configuration"
3. Verify all systems show ✅

---

## 📞 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Resend Dashboard:** https://resend.com/dashboard
- **Stripe Dashboard:** https://stripe.com/dashboard
- **FedEx Developer:** https://developer.fedex.com

---

## 🆘 Need Help?

### **✉️ Want Simple Email Solution?**
- **EASY EMAIL GENERATOR:** See `QUICK_EMAIL_COPY_PASTE.md` ⭐⭐⭐ **BEST SOLUTION!**
- **Summary:** See `EMAIL_SOLUTION_SUMMARY.md` - Quick overview
- **No deployment, 30 seconds, 100% reliable!**

### **🔥 Green Embed Not Showing? (Alternative Method)**
- **Quick fix:** See `QUICK_FIX_CARD.md`
- **Can't open dashboard?** See `HOW_TO_OPEN_DASHBOARD.md`
- **Complete solution:** See `SOLUTION_GREEN_EMBED.md`
- **Deployment help:** See `DEPLOY_EDGE_FUNCTION.md`

### **Other Documentation:**
- **Test email backup:** See `TEST_DISCORD_BACKUP.md`
- **Email fallback system:** See `DISCORD_EMAIL_FALLBACK.md`
- **Quick email guide:** See `QUICK_EMAIL_GUIDE.md`
- **Setup questions:** See `SETUP_GUIDE.md`
- **Tracking emails:** See `TRACKING_EMAIL_GUIDE.md`
- **Testing:** See `TESTING_GUIDE.md`
- **FedEx setup:** See `FEDEX_SHIPPING_SETUP.md`

---

## 💰 Costs

**Free:**
- Supabase (free tier)
- Resend (100 emails/day free)
- Discord notifications

**Paid:**
- Stripe: 2.9% + $0.30 per transaction
- FedEx: Shipping costs only

---

## 🎉 Status

**System Status:** ✅ Fully Operational  
**Last Updated:** January 2025  
**Version:** 2.0 (Multi-item cart system)

---

**Everything is ready to accept and manage orders!** 🚀
