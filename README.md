# Crown & Cross — Public Storefront

> **The official online storefront for Crown & Cross football jerseys.**  
> *"Some wear fashion. We wear football."* • *"Wear Your Club. Wear Your Story."*

Built with **Next.js (App Router)** and designed with an **Olive Green & Gold** sports luxury aesthetic. Deployed seamlessly to **Vercel**.

---

## ⚡ Quick Start (< 5 Minutes)

### Prerequisites
- **Node.js**: v18.0+
- **npm**: v9.0+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🌐 Deploy to Vercel

This repository is structured for one-click deployment on [Vercel](https://vercel.com):

1. Import this repository (`CC-Hosting-Public`) into your Vercel dashboard.
2. Framework Preset: **Next.js**.
3. Root Directory: `./`.
4. Build Command: `npm run build` (or Next.js default).
5. Output Directory: `.next`.
6. Click **Deploy**.

Every commit to `main` will trigger an automated redeployment with zero downtime.

---

### 🔑 Configuring the Resend API Key in Vercel (For Automated Estimates)

The team/bulk jersey estimate request form (`/request-estimate`) sends email quotations to `crownandcross29@gmail.com` using the **Resend** transactional email API.

Follow these steps to configure it in Vercel:

#### Step 1: Obtain your Resend API Key
1. Go to [https://resend.com](https://resend.com) and log in (or create a free account).
2. Navigate to **API Keys** in the sidebar ([https://resend.com/api-keys](https://resend.com/api-keys)).
3. Click **Create API Key**.
4. Name: `Crown & Cross Storefront`.
5. Permission: **Full Access** or **Sending Access**.
6. Copy your generated key (starts with `re_...`).

#### Step 2: Add to Vercel Environment Variables
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select your **`CC-Hosting-Public`** project.
2. Click **Settings** (top navigation tab) → **Environment Variables** (left sidebar).
3. Add the following variable:
   * **Key:** `RESEND_API_KEY`
   * **Value:** `re_your_copied_key_here`
   * **Target Environments:** Check all: **Production**, **Preview**, **Development**.
4. Click **Save**.

#### Step 3: (Optional) Custom Sender & Notification Address
By default, the app uses Resend's sandbox (`onboarding@resend.dev`) and delivers notifications to `crownandcross29@gmail.com`. You can optionally add:
* **`ESTIMATE_NOTIFICATION_EMAIL`**: Recipient inbox (e.g. `crownandcross29@gmail.com`).
* **`RESEND_FROM_EMAIL`**: Custom verified sender (e.g. `Crown & Cross <orders@yourdomain.com>`) once your custom domain is verified in Resend.

#### Step 4: Apply to Deployment
> [!IMPORTANT]
> In Vercel, new environment variables apply to **subsequent builds**.
> After saving the variable, go to the **Deployments** tab, click **`...`** on the latest deployment, and click **Redeploy** (or push a new commit to `main`).

---

## ✨ Features

- **Hero & Heritage Showcase**: High-impact brand statement, football culture ethos, and quick action filters.
- **Dynamic Catalog Filtering**:
  - Filter by Category: **Club**, **Country**, **★ Retro Classics**.
  - Filter by Quality Tier: **Player Version**, **Master Copy**, **Fan Version Set**, **Embroidered**, **Sublimation**.
  - Live search by kit name, team, or season with sticky navbar anchor scrolling offset.
- **Product Detail Page (PDP)**:
  - **Interactive Image Carousel**: Mobile touch-swipe, desktop click-arrows, dot counts, and thumbnail selection.
  - Sizing selector with live measurement guide modal.
  - Clean arrow breadcrumb navigation and route-change scroll-to-top reset.
  - One-click "Add to Cart" and direct "Buy Now with WhatsApp".
- **Slide-out Cart Drawer & Persistent State**:
  - **Free Shipping Progress Meter**: Real-time progress towards the ₹1,499 free shipping threshold (Standard fee ₹80).
  - **Scoped LocalStorage Persistence**: Cart items and customer delivery info persist across page refreshes via scoped storage (`cc_cart_v1`, `cc_customer_v1`) with hydration gating (`isLoaded`) and cross-tab sync.
  - Size and quantity adjustments with dynamic badge counter animations.
- **Dual Checkout System**:
  - **1. Universal WhatsApp Direct Order**: Deep links directly via `whatsapp://send` and the modern `https://wa.me/` click-to-chat bridge to native WhatsApp applications across Windows, macOS, Android, and iOS (iPhone/iPad). Pre-fills recipient (`+91 76959 24602`) and pre-typed order details with ASCII-sanitized text. Synchronous tab reuse and graceful WhatsApp Web fallback on desktop.
  - **2. Instant UPI QR Code Generator**: Generates client-side dynamic QR codes for payee **Jason Clement** (`jasonclement.jm-1@okhdfcbank`). Features pre-filled transaction reference (`tr`), order note (`tn`), and 1-click Order ID copy button with clipboard feedback.
- **📱 Full Responsive Multi-Screen Compatibility**:
  - **Large Screens (Desktop & 4K):** Proportional fluid typography (`clamp()`), max-width boundaries, and clean multi-column layouts.
  - **Medium Screens (Tablets & Laptops):** 2–3 column adaptive grids and seamless navigation transitions.
  - **Small Screens (Mobile Phones):** Fluid 1-column collapse (`minmax(min(100%, ...), 1fr)`), touch-swipe gesture carousel, full-width drawers, and viewport-bounded modals with zero horizontal scroll.
- **Complete Trust & Policy Suite**:
  - Size & Fit Guide (`/size-guide`)
  - Our Story & Brand Ethos (`/about`): Centered emblem and manifesto layout with responsive clamp typography.
  - Shipping Policy (`/shipping-policy`):
    - • **Metro Cities:** 3–5 Business Days
    - • **Rest of India:** 5–8 Business Days
  - Returns & Exchange Policy (`/returns-policy`) — 5–7 days sizing exchange.
  - Terms of Service (`/terms`) & Privacy Policy (`/privacy`).
  - **Bulk & Team Estimate Request Form (`/request-estimate`)**: Automated email quotation dispatch powered by **Resend** to `crownandcross29@gmail.com` with instant WhatsApp fallback.
  - **Trust Guarantee Footer**: Priority UPI payee badge (**Jason Clement**), 1-click **Contact Us** & **Email Us** links, Pan-India dispatch, and 5-7 days size exchange badges.
- **✨ Navigation & Header Polish**:
  - Distinct static **Vintage Amber** (`#f59e0b`) highlight for **Retro Kits** that remains static on hover.
  - Action-oriented **"Contact Us"** header button replacing raw phone numbers for a cleaner, modern look.
  - Mobile drawer with structured **"Contact Us (WhatsApp)"** action.
  - **Horizontal Scrolling Announcement Marquee**: Smooth infinite loop ticker on narrow screens ($\le 860\text{px}$) with touch-drag scrolling and hover pause.
  - **Official Instagram Profile Integration**: Instant access to `@_crown_and_cross_` via header button beside WhatsApp, mobile drawer, and footer brand card.
  - **Global Interactive Product Search Modal**: Magnifying glass trigger and `Ctrl+K`/`Cmd+K` shortcut revealing real-time product matching, available kit names, live thumbnails, pricing, and 1-click PDP navigation.

---

## ⚙️ Environment Variables (Email Service)

Create `.env.local` in `CC-Hosting-Public/` (copied from `.env.example`):

```bash
# Resend API Key (Obtain from https://resend.com/api-keys)
RESEND_API_KEY=re_your_api_key_here

# Recipient for estimate email alerts
ESTIMATE_NOTIFICATION_EMAIL=crownandcross29@gmail.com

# Verified sender address (Use onboarding@resend.dev during testing)
RESEND_FROM_EMAIL=Crown & Cross <onboarding@resend.dev>
```

> **Note on Vercel:** Add `RESEND_API_KEY` to your Vercel Project Settings under **Environment Variables** for production email delivery.

## 🎨 Design Tokens (Olive Green & Gold)

- **Background:** Rich Pitch Olive (`#0d140f`), Surface Olive (`#131e17`), Elevated Olive (`#19271e`)
- **Accents:** Champagne / Warm Gold (`#c8a96a`, `#dfc185`, `#f4e8cb`), Vintage Amber (`#f59e0b`)
- **Typography:** Playfair Display (Serif Headings), Plus Jakarta Sans (UI Body), Bebas Neue (Sports Badges)

---

## 📜 Changelog

### [Unreleased]
#### Added
- **Global Interactive Product Search**: Added top magnifying glass button, mobile drawer search entry, and `Ctrl+K` shortcut opening `SearchModal.jsx` with real-time search, available kit names, thumbnails, pricing, and 1-click drilldown navigation.
- **Official Instagram Channel Integration**: Added clickable Instagram button (`nav-insta-btn`) beside WhatsApp in navbar, drawer link, and footer brand card for `@_crown_and_cross_`.
- **Responsive Announcement Bar Marquee**: Added dual-track continuous horizontal scrolling ticker on narrow screens ($\le 860\text{px}$) with manual touch horizontal scroll support and auto-pause on hover/tap.

#### Fixed
- **Product Drilldown Client Exception**: Fixed `ReferenceError: relatedKits is not defined` on `/product/[id]` by correcting the related kits variable mapping.

#### Changed
- **Header**: Replaced raw phone number display with clean, action-oriented **Contact Us** button linking directly to WhatsApp.
- **Header**: Styled **Retro Kits** navigation link with a distinct static **Vintage Amber** (`#f59e0b`) accent with consistent hover rules.
- **Footer**: Replaced raw phone number with **Contact Us** and raw email address with **Email Us** in the Support & Orders column.
- **Footer**: Elevated **UPI Payee: Jason Clement** to the top of the Support & Orders section for immediate trust validation.
- **About Page**: Centered the Crown & Cross logo image and manifesto headings with flexbox alignment and fluid clamp typography (`clamp(28px, 5vw, 42px)`).

---

## 📚 Documentation
- [Code Documentation (Components & State)](CODE_DOCUMENTATION.md)
- [Design Philosophy (UX & Aesthetics)](DESIGN_PHILOSOPHY.md)

---

## 📞 Support & Inquiries
- **Instagram:** [@_crown_and_cross_](https://www.instagram.com/_crown_and_cross_)
- **WhatsApp:** [Contact Us](https://wa.me/917695924602) (+91 76959 24602)
- **Email:** [Email Us](mailto:crownandcross29@gmail.com) (crownandcross29@gmail.com)
- **Base:** Chennai, Tamil Nadu, India
- **Owner:** Jason Clement