import type { Discount, Product } from "@/lib/types";

export const PRODUCT_SEED: Product[] = [
  {
    id: "gibson-les-paul-standard-60s",
    name: "Gibson Les Paul Standard '60s",
    description:
      "Classic mahogany body and AA figured maple top with Burstbucker pickups.",
    priceCents: 299999,
    stockOnHand: 8,
    reserved: 0,
  },
  {
    id: "gibson-sg-standard",
    name: "Gibson SG Standard",
    description:
      "Iconic double-cut body with a slim taper neck and aggressive midrange bite.",
    priceCents: 179999,
    stockOnHand: 12,
    reserved: 0,
  },
  {
    id: "gibson-es-335",
    name: "Gibson ES-335",
    description:
      "Semi-hollow versatility with warm resonance and articulate humbucker response.",
    priceCents: 349999,
    stockOnHand: 5,
    reserved: 0,
  },
  {
    id: "gibson-explorer-antique-natural",
    name: "Gibson Explorer Antique Natural",
    description:
      "Modern high-output power in a bold angular body with excellent sustain.",
    priceCents: 199999,
    stockOnHand: 6,
    reserved: 0,
  },
  {
    id: "gibson-flying-v",
    name: "Gibson Flying V",
    description:
      "Stage-ready statement guitar with fast playability and bright, punchy attack.",
    priceCents: 219999,
    stockOnHand: 4,
    reserved: 0,
  },
  {
    id: "gibson-j-45-standard",
    name: "Gibson J-45 Standard",
    description:
      "Legendary round-shoulder acoustic with rich lows and clear projection.",
    priceCents: 289999,
    stockOnHand: 9,
    reserved: 0,
  },
];

export const DISCOUNT_SEED: Discount[] = [
  {
    id: "cart-10-over-5000",
    name: "10% Off Orders Over $5,000",
    description: "A 10% cart discount applies when subtotal is at least $5,000.",
    type: "percentage_cart",
    active: true,
    value: 10,
    thresholdCents: 500000,
  },
  {
    id: "bundle-sg-duo",
    name: "SG Duo Bundle",
    description:
      "Buy 2 or more SG Standard guitars and receive 15% off those SG line items.",
    type: "bulk_product",
    active: true,
    value: 15,
    productId: "gibson-sg-standard",
    minQuantity: 2,
  },
  {
    id: "flying-v-spotlight",
    name: "Flying V Spotlight",
    description: "20% off every Gibson Flying V line item.",
    type: "product_percentage",
    active: true,
    value: 20,
    productId: "gibson-flying-v",
  },
  {
    id: "cash-off-300",
    name: "$300 Cart Reward",
    description: "Take $300 off orders above $3,000.",
    type: "fixed_cart",
    active: true,
    value: 30000,
    thresholdCents: 300000,
  },
];
