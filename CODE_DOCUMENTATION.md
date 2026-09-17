# Crown & Cross — Code Documentation (CC-Hosting-Public)

This document details the frontend architecture, component hierarchy, state management, and payment integrations in `CC-Hosting-Public`.

---

## 1. Directory Structure

```
CC-Hosting-Public/
├── app/
│   ├── layout.jsx               # Root layout with CartProvider & global wrappers
│   ├── globals.css              # Olive Green & Gold design tokens & typography
│   ├── page.jsx                 # Home / Catalog / Showcase page
│   ├── product/[id]/page.jsx    # Product Detail Page (PDP) with Carousel
│   ├── size-guide/page.jsx      # Dimension tables & fit specs
│   ├── about/page.jsx           # Manifesto & brand story
│   ├── shipping-policy/page.jsx # Shipping terms & delivery SLAs
│   ├── returns-policy/page.jsx  # 5-7 days exchange guidelines
│   ├── terms/page.jsx           # Legal terms of service
│   ├── privacy/page.jsx         # DPDPA compliance privacy policy
│   └── request-estimate/page.jsx# Bulk team order inquiry form
├── components/
│   ├── Navbar.jsx               # Header with logo, nav links, and cart toggle
│   ├── Footer.jsx               # Brand footer with contact info & policy links
│   ├── ProductCard.jsx          # Catalog kit card with hover scaling & quick add
│   ├── JerseyCarousel.jsx       # Swipe/arrow/dot-count responsive carousel
│   ├── CartDrawer.jsx           # Slide-out cart with shipping meter & checkout
│   ├── UpiModal.jsx             # Client-side dynamic UPI QR code generator
│   ├── SearchModal.jsx          # Live product search modal with filter chips & thumbnails
│   └── LayoutClientWrapper.jsx  # Client boundary for global modals
├── context/
│   └── CartContext.jsx          # React Context for cart state & LocalStorage
├── lib/
│   ├── products.js              # Data reader for products.json
│   └── whatsapp.js              # Universal cross-platform WhatsApp launcher
├── public/
│   ├── data/products.json       # Master catalog database
│   └── images/logo.jpeg         # Brand emblem asset
├── .gitignore                   # Submodule ignore rules
└── package.json                 # Next.js frontend manifest
```

---

## 2. State Management: `context/CartContext.jsx`

The global shopping cart is managed via React Context and automatically synchronizes with browser `localStorage` under scoped keys `cc_cart_v1` and `cc_customer_v1`. 

### Key Capabilities & Reliability Guards:
- **Scoped Storage Keys & Origin Validation:** Storage keys are namespaced (`cc_cart_v1`, `cc_customer_v1`) to isolate shopping session data and avoid collisions with external or legacy scripts.
- **Hydration Gating (`isLoaded`):** Protects against Server-Side Rendering (SSR) discrepancies and prevents the initial empty state from prematurely wiping stored cart or customer information during component mount.
- **Multi-Tab Synchronization:** A `window.addEventListener('storage', ...)` listener monitors cross-tab modifications, keeping badge counts and cart items in immediate sync across all open browser tabs.
- **Sanitization & Payload Defensive Checks:** Enforces strict array typing on cart items, clamps quantities (`Math.max(1, qty)`), and sanitizes customer fields (`name`, `phone`, `address`, `city`, `pincode`, `note`).
- **Standardized Order ID Generator:** Creates collision-resistant, human-friendly order references using base36 epoch timestamps and random entropy tokens (e.g. `CC-M3X9K2-7A9B`).

### Exposed Context Values:
- **`items`**: Array of validated cart items `{ key, id, name, size, price, mrp, image, category, subCategory, quantity }`.
- **`customer` / `setCustomer`**: Delivery address details `{ name, phone, address, city, pincode, note }` preserved in `localStorage`.
- **`isLoaded`**: Boolean indicating whether cart and customer data have finished hydrating from `localStorage`.
- **`addToCart(product, size, quantity)`**: Adds a new item or increments an existing line item matching `id` and `size`.
- **`updateQuantity(key, delta)`**: Modifies item count; automatically removes line items when quantity drops to 0.
- **`removeItem(key)`**: Deletes a specific line item by compound key.
- **`subtotal`**: Sum of item prices × quantities.
- **`isFreeShipping`**: Boolean (`subtotal >= 1499`).
- **`shipping`**: `0` if cart is empty or free shipping unlocked, otherwise `80` (Standard fee).
- **`grandTotal`**: `subtotal + shipping`.
- **`amountToFreeShipping`**: `Math.max(0, 1499 - subtotal)`.
- **`freeShippingProgress`**: Percentage (`0` to `100%`) driving the Cart Drawer progress bar.
- **`activeUpiOrder` / `setActiveUpiOrder`**: Controls the visibility and payload of the instant UPI QR payment modal.

---

## 3. Image Carousel: `components/JerseyCarousel.jsx`

Built to satisfy the exact requirement: **Swipe, Click Arrow, Count Dots**.
- **Mobile Swipe**: Tracks `onTouchStart`, `onTouchMove`, and `onTouchEnd`. A horizontal delta of `> 45px` triggers previous/next transitions.
- **Click Arrows**: Floating circular buttons positioned on the left and right edges for desktop users.
- **Count Dots**: An indicator pill rendering individual dots for each image in `safeImages`, highlighting the active index.
- **Thumbnail Strip**: Scrollable thumbnails for direct jumping between angles.

---

## 4. Payment Integrations

### Universal WhatsApp Engine (`lib/whatsapp.js`)
Instead of legacy redirect links that drop text parameters, the storefront routes all WhatsApp actions through a specialized launcher:
- **Direct Protocol Scheme (`whatsapp://send?phone=...&text=...`):** Immediately invokes the registered WhatsApp application on Windows, macOS, Android, and iOS (iPhone/iPad).
- **Universal Web Fallback (`https://wa.me/`):** Migrated to Meta's official `wa.me/<phone>?text=...` click-to-chat bridge. Bypasses intermediate landing blockers, ensures synchronous desktop tab reuse, and provides seamless mobile browser fallback without dropping order parameters.
- **Text Sanitization (`sanitizeWhatsAppText`):** Converts non-standard box-drawing characters (`━`, `─`, `═`) into standard hyphens (`-`), ensuring URL query strings are never truncated or corrupted by carrier webviews or intent handlers.

Structured message payloads include:
- Unique Order ID (`CC-XXXXXX`)
- Itemized jersey titles, quality tiers, sizes, and quantities
- Subtotal, delivery charges, and grand total
- Customer delivery address and optional notes

### Dynamic Client-Side UPI QR (`components/UpiModal.jsx`)
Encodes a standard NPCI UPI URI:
```
upi://pay?pa=jasonclement.jm-1@okhdfcbank&pn=Jason%20Clement&am={grandTotal}&tn=Order%20{orderId}&tr={refId}&mode=02&cu=INR
```
- **Live QR Rendering:** The `qrcode` package converts this URI to a high-resolution base64 PNG data URL in the user's browser, allowing payment through Google Pay, PhonePe, Paytm, or BHIM without any backend server.
- **Transaction Reference & Note:** Pre-fills `tn=Order {orderId}` and `tr={refId}` for transparent bank-statement reconciliation.
- **1-Click Order ID Copy:** Features an inline copy button with instantaneous visual confirmation feedback (`Copied!` tooltip/state).
- **Screenshot Dispatch:** Includes direct WhatsApp launch button allowing customers to forward payment confirmation screenshots directly to Jason Clement.

---

## 5. Automated Email Service: `/api/estimate`

Powered by the official **Resend** SDK (`resend`).

### Endpoint Specification:
- **Method:** `POST`
- **Route:** `/api/estimate`
- **Headers:** `Content-Type: application/json`

### Request Payload:
```json
{
  "name": "Arun Kumar",
  "phone": "+91 98765 43210",
  "email": "arun@example.com",
  "organization": "Marina FC",
  "kitType": "Club Classic",
  "qualityTier": "Player Version",
  "quantity": 14,
  "customNames": "Yes",
  "notes": "Need customized name and numbers for tournament on Oct 15"
}
```

### Response Codes:
- `200 OK`: `{ success: true, id: "msg_xxx", message: "Estimate request emailed to crownandcross29@gmail.com successfully." }`
- `400 Bad Request`: Missing mandatory fields (`name` or `phone`).
- `503 Service Unavailable`: Triggered if `RESEND_API_KEY` is missing or set to placeholder; frontend gracefully exposes direct WhatsApp and `mailto:` buttons.
- `502 Bad Gateway`: Upstream Resend API delivery rejection.

### Email Layout & Styling:
Generates an inline-styled, dark-mode luxury HTML email containing:
- Crown & Cross gold header emblem.
- Structured specification table with clickable `wa.me` customer response link.
- Automated `replyTo` header pointing directly to the customer's submitted email.

### Vercel Production Environment Setup:
To enable live transactional emailing in production:
1. Navigate to **Vercel Dashboard** → `CC-Hosting-Public` → **Settings** → **Environment Variables**.
2. Add the following keys:
   | Variable | Value | Required | Description |
   |---|---|---|---|
   | `RESEND_API_KEY` | `re_...` | **Yes** | Generated secret key from [resend.com/api-keys](https://resend.com/api-keys) |
   | `ESTIMATE_NOTIFICATION_EMAIL` | `crownandcross29@gmail.com` | Optional | Inbox receiving team jersey requests (defaults to `crownandcross29@gmail.com`) |
   | `RESEND_FROM_EMAIL` | `Crown & Cross <orders@yourdomain.com>` | Optional | Verified custom sender address in Resend (defaults to sandbox `onboarding@resend.dev`) |
3. Trigger a **Redeploy** on Vercel to inject new environment variables into the serverless runtime.
4. **Fallback Handling**: If `RESEND_API_KEY` is not provided or fails, the frontend dynamically presents fallback options: a direct pre-filled WhatsApp quotation chat and a pre-composed `mailto:` link.

---

## 6. Multi-Screen Responsive Architecture & Navigation Polish

The storefront is engineered for seamless rendering across **Large**, **Medium**, and **Small** viewports:

1. **Next.js 14 Viewport Export:** `app/layout.jsx` exports explicit `viewport` configurations (`width: 'device-width'`, `initialScale: 1`), enforcing proper mobile browser scaling.
2. **Route Navigation Scroll Reset:** `LayoutClientWrapper.jsx` executes an automatic `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` on pathname transitions, preventing deep scroll retention when moving between PDP, policy pages, and homepage.
3. **Anchor Scrolling Offset:** The catalog anchor `#catalog` is configured with `scroll-margin-top: 80px` to clear the sticky navbar without obscuring filter controls.
4. **Fluid Grid Layouts:** All grids use responsive auto-fit boundaries:
   - Catalog: `gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))'`
   - Featured: `gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))'`
   - PDP: `gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))'`
   - Footer: `gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))'`
5. **No Horizontal Overflow:** Containers are protected by `maxWidth: 100%`, `overflow-x: hidden` on body, and `clamp()` spacing.
6. **Touch Interactions:** `JerseyCarousel.jsx` features 45px swipe detection for natural mobile flick transitions.
7. **Adaptive Modals:** `UpiModal.jsx` incorporates `maxHeight: '90vh'` and `overflowY: 'auto'` to maintain usability on compact and landscape screens.
8. **Trust Guarantee Bar:** Footer integrates verified trust badges (Verified UPI, Direct WhatsApp, Pan-India Dispatch, 5-7 Days Sizing Exchange) for buyer confidence.
9. **Action-Oriented Navigation Hooks (`Navbar.jsx` & `Footer.jsx`):** Replaced raw phone numbers with semantic **"Contact Us"** and raw emails with **"Email Us"**, backed by deep-link triggers (`getWhatsAppUrl`, `mailto:`), mobile dropdown parity, and tooltip descriptions for screen readers.
10. **Static Accent Styling (`globals.css`):** Configured `.retro-highlight` and `.retro-mobile-link` with a permanent **Vintage Amber** (`#f59e0b`) accent with identical `:hover` color rules, ensuring Retro Kits remain a distinct visual anchor without flickering or distracting animations.
11. **Centered Manifesto Architecture (`app/about/page.jsx`):** Employs a centered flex-column container (`display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center`) with `display: block` and `objectFit: 'cover'` on the brand emblem, resolving inline baseline misalignment and providing responsive `clamp(28px, 5vw, 42px)` typography.
12. **Priority Trust Reordering (`components/Footer.jsx`):** Elevated `UPI Payee: Jason Clement` to position #1 under "Support & Orders" to provide immediate merchant validation above communication links.
13. **Dual-Track Infinite Announcement Marquee (`globals.css` & `Navbar.jsx`):** On screens $\le 860\text{px}$, the top announcement bar displays two mirrored `.announcement-track` rows governed by `@keyframes bannerMarquee` (26s linear loop). Eliminates text truncation while supporting touch horizontal swiping and hover pause.
14. **Universal Product Search Engine (`components/SearchModal.jsx`):**
    - Accessible via header magnifying glass, mobile menu drawer, and global keyboard shortcut (`Ctrl+K` / `Cmd+K`).
    - Queries `products.json` dynamically with multi-keyword token matching (`name`, `team`, `season`, `subCategory`, `description`).
    - Surfaces exact kit names, quality badges, live pricing, stock availability, and quick suggestion pills ("Real Madrid", "Argentina", "Retro").
    - 1-click navigation routes directly to `/product/[id]` with auto modal closure.
15. **Cross-Platform Instagram Integration:**
    - Header action icon button (`.nav-insta-btn`) adjacent to WhatsApp on desktop and mobile viewports.
    - Mobile drawer entry (`.mobile-dropdown-insta`).
    - Rich footer brand card with custom Instagram gradient icon, inline support link, and bottom metadata handle pointing to `https://www.instagram.com/_crown_and_cross_`.
16. **Product Detail Page Related Kits Integrity (`app/product/[id]/page.jsx`):**
    - Fixed related kits variable mapping (`relatedKits`) matching the JSX renderer to prevent client-side runtime reference exceptions during product drilldown.
    - Added case-insensitive, URL-decoded ID matching (`decodeURIComponent(String(id)).toLowerCase()`) for resilient routing.
17. **Two Products Per Row Mobile Grid (`ProductCard.jsx`, `globals.css`):**
    - Under `@media (max-width: 640px)`, `.catalog-grid` and `.featured-grid` activate `grid-template-columns: repeat(2, minmax(0, 1fr)) !important` with an 8px grid gap.
    - Card media `.card-image-wrap` enforces a fixed `aspect-ratio: 1 / 1.15` to ensure consistent visual alignment across varying kit photography.
    - Mobile card typography scales via `.product-card h3 { font-size: 13px }` with multi-line clamping and tight pill tags (`font-size: 9px`).
18. **Mobile-Only 1-Tap UPI App Launcher (`UpiModal.jsx`, `CartDrawer.jsx`, `app/product/[id]/page.jsx`):**
    - Implemented native `upi://pay?pa=...&pn=...&am=...&tn=...&cu=INR` intent deep linking.
    - Displayed strictly on mobile viewports (`<= 768px`) via `.mobile-only-upi-block`, `.mobile-only-cart-upi-btn`, and `.mobile-only-pdp-upi-btn`.
    - Clicking directly invokes installed UPI applications (Google Pay, PhonePe, Paytm, CRED, BHIM) on Android and iPhone devices without forcing users to scan their own screens.
19. **Mobile Section Spacing & Bottom Padding Optimization (`globals.css`, `app/page.jsx`, `app/product/[id]/page.jsx`):**
    - Tightened desktop-scale section margins (`margin: 90px auto 0` down to `24px`) across catalog and story sections on mobile devices.
    - Reduced footer padding and `.pdp-container` / `.pdp-related-section` bottom margins on screens $\le 640\text{px}$, eliminating blank dead scrolls below product tiles.
20. **Size-Specific Stock Quantity Architecture (`products.json`, `app/product/[id]/page.jsx`, `components/ProductCard.jsx`):**
    - **Data Schema (`stockBySize`)**: Each jersey entry maintains an explicit size-to-quantity map: `{ "S": 4, "M": 8, "L": 8, "XL": 3, "XXL": 1 }`.
    - **Dynamic PDP Size Selector**: Inspects `stockBySize[size] ?? 0`. Sizes with 0 stock are given `.sold-out` styling (50% opacity, strikethrough line, `not-allowed` cursor) and disabled from selection.
    - **Clean In-Stock Display & Low-Stock Urgency**: When stock is $> 2$, displays clean `● In Stock` without unit count leakage. When remaining stock for the chosen size drops to $\le 2$, dynamically triggers `⚡ Only X left in Size [Size]!`.
    - **Auto-Selection**: Initializes PDP state and quick-add actions to the first in-stock size rather than blindly picking `sizes[0]`.
    - **Quantity Stepper Guard**: Max purchase quantity dynamically caps at `availableStockForSize`, preventing over-ordering.
21. **Minimalist Icon-Only Header Actions & Footer Contact Standardization (`Navbar.jsx`, `Footer.jsx`, `globals.css`):**
    - Simplified header Search (`.nav-search-btn`) and Instagram (`.nav-insta-btn`) to circular `38px x 38px` icon buttons with centered Lucide icons (`Search`, `Instagram`), removing text spans for an uncluttered luxury aesthetic.
    - Standardized footer support links strictly as `Contact Us: Whatsapp` and `Contact Us: Instagram` with matching hover effects.
22. **Limited Stock Notification & Cart Overflow Protection (`CartContext.jsx`, `LayoutClientWrapper.jsx`, `CartDrawer.jsx`):**
    - **Stock Toast System (`stockToast`, `showStockToast`)**: Dispatches auto-dismissing (3.8s) floating glassmorphism amber toasts with `AlertTriangle` icon on illegal increment attempts.
    - **In-Cart Stock Deduction**: PDP dynamically cross-checks cart quantities for the selected size (`remainingStock = availableStock - inCartQty`).
    - **Button Auto-Disable**: Automatically disables the Add to Cart button with text `All Stock in Cart (X/X)` and an inline alert banner when all available inventory for that size is already in the cart.
    - **Tactile Feedback**: Implemented `animate-shake` on the quantity stepper and disabled `+` buttons across both PDP and slide-out Cart Drawer when inventory ceiling is reached.

