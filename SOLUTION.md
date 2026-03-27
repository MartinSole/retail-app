# Solution Walkthrough

Hey! Welcome to the Gibson Retail App. Here's everything you need to know to get it running and understand how it's put together.

## What's in this repo?

This single repository has two complete apps:

- A **Next.js web app** that also acts as the Backend for Frontend (BFF) API — all in one, using Next.js Route Handlers
- A **React Native mobile app** (built with Expo) that talks to that same API

The product catalogue is all Gibson guitars, and the whole shopping flow — browsing, reserving stock, checking out, and applying discounts — works end to end in both apps.

## How it's structured

```
/                   → Next.js BFF + web app
src/app/            → Web pages (App Router)
src/app/api/        → BFF API routes
src/lib/store.ts    → All the core domain logic lives here
src/lib/seed.ts     → Hardcoded Gibson products and discount data
mobile/             → Expo React Native app
```

I kept the core business logic in one place (`store.ts`) so it's easy to test in isolation, while the web and mobile clients both treat it as a proper API — just like they'd talk to a separate backend service.

## What's been built

Here's a quick summary of everything that's covered:

**Products & catalogue**
- Browse all 6 Gibson guitars with live stock numbers
- View full product details
- Stock levels update in real time as carts check out

**Discounts**
- Four distinct promotion types (details below)
- Applied automatically at checkout — no coupon codes needed

**Shopping cart**
- Start a session and build your cart
- Add, update, and remove items
- Stock is reserved while your cart is active
- Cart automatically expires after **2 minutes of inactivity** and reserved stock is released back

**Checkout**
- Happy path: stock is decremented, discounts applied, order summary returned
- Unhappy path: clear feedback on which items are out of stock so the customer knows exactly what to fix
- Reservations are always released, whether checkout succeeds or fails

**Error handling**
- Structured error responses from the API
- Friendly, readable messages shown in both the web and mobile UIs

**Tests**
- Domain logic (backend store)
- Web component tests
- Mobile utility tests

## How the discount engine works

All discounts are seeded at startup and evaluated automatically when a customer checks out. There are four types:

| Type | How it works |
|---|---|
| `percentage_cart` | A percentage off the whole cart, once the subtotal hits a threshold |
| `fixed_cart` | A flat dollar amount off the cart, once the subtotal hits a threshold |
| `bulk_product` | A percentage off a specific product's line total when you buy enough of them |
| `product_percentage` | A percentage off every unit of a specific product, no minimum required |

Multiple discounts can apply at once — they stack additively, and the total discount is capped so it never exceeds what you're paying.

## Data & persistence

There's no database here — everything lives in memory, which keeps setup simple:

- Product and discount catalogues are seeded from `src/lib/seed.ts` when the app starts
- Cart state is managed in memory at runtime
- Reserved stock is tracked per cart on each product record
- A background interval sweeps expired carts every 10 seconds and releases their reservations

This means everything resets when the server restarts — which is fine for this exercise.

---

## Getting it running

### What you'll need

- Node.js 20+
- npm 10+
- Xcode (for iOS simulator) or Android Studio (for Android emulator)

### Install dependencies

```bash
# Root (web app + BFF)
npm install

# Mobile app
cd mobile && npm install
```

### Start the BFF + web app

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Start the React Native app

Make sure the BFF is already running, then in a new terminal:

```bash
cd mobile
npm run ios
# or
npm run android
```

By default the mobile app points to `http://localhost:3000`. If you're running the BFF on a different address (e.g. on a physical device), just set the environment variable:

```bash
EXPO_PUBLIC_API_BASE_URL=http://your-local-ip:3000 npm run ios
```

Or create a `mobile/.env` file:

```
EXPO_PUBLIC_API_BASE_URL=http://your-local-ip:3000
```

### Run the tests

```bash
npm run test
```

This runs both the web and mobile test suites back to back. You can also run them individually:

```bash
npm run test:web     # Next.js + domain tests only
npm run test:mobile  # React Native utility tests only
```

### Production build (web)

```bash
npm run build
npm run start
```

---

## API reference

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/api/session` | Start a new cart session |
| `GET` | `/api/products` | List all products with stock |
| `GET` | `/api/products/:id` | Get a single product |
| `GET` | `/api/discounts` | List all active discounts |
| `GET` | `/api/discounts/:id` | Get a single discount |
| `GET` | `/api/cart?cartId=...` | Fetch cart contents |
| `POST` | `/api/cart/items` | Add an item to the cart |
| `PATCH` | `/api/cart/items` | Update item quantity |
| `DELETE` | `/api/cart/items?cartId=...&productId=...` | Remove an item |
| `POST` | `/api/checkout` | Complete the purchase |

---

## Assumptions & notes

- The original brief asked for NestJS + React Native. I've used **Next.js as the BFF** instead — it gives the same clean API-first separation while keeping the repo simpler to clone and run locally without needing two servers.
- The web app calls the BFF on the same origin by default. Set `NEXT_PUBLIC_API_BASE_URL` if you want to point it elsewhere.
- There's no auth — the exercise doesn't require it.
- Payment is fully simulated — checkout just confirms the order without connecting to any real payment service.
