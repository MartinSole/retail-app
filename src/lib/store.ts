import { randomUUID } from "crypto";

import { DISCOUNT_SEED, PRODUCT_SEED } from "@/lib/seed";
import type {
  AppliedDiscount,
  Cart,
  CartLine,
  CartView,
  CheckoutFailure,
  CheckoutResult,
  Discount,
  Product,
} from "@/lib/types";

const CART_TTL_MS = 2 * 60 * 1000;

type StoreState = {
  products: Product[];
  discounts: Discount[];
  carts: Map<string, Cart>;
  cleanupTimerStarted: boolean;
};

type GlobalStore = typeof globalThis & {
  __retailStoreState?: StoreState;
};

const g = globalThis as GlobalStore;

function cloneProductSeed(): Product[] {
  return PRODUCT_SEED.map((p) => ({ ...p }));
}

function cloneDiscountSeed(): Discount[] {
  return DISCOUNT_SEED.map((d) => ({ ...d }));
}

function createInitialState(): StoreState {
  return {
    products: cloneProductSeed(),
    discounts: cloneDiscountSeed(),
    carts: new Map<string, Cart>(),
    cleanupTimerStarted: false,
  };
}

const state = g.__retailStoreState ?? createInitialState();
g.__retailStoreState = state;

function startCleanupTimer() {
  if (state.cleanupTimerStarted) {
    return;
  }

  state.cleanupTimerStarted = true;
  setInterval(() => {
    cleanupInactiveCarts();
  }, 10_000);
}

function findProductOrThrow(productId: string): Product {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }
  return product;
}

function now() {
  return Date.now();
}

function isExpired(cart: Cart): boolean {
  return now() - cart.lastActivityAt > CART_TTL_MS;
}

function releaseReservationsForCart(cart: Cart) {
  Object.entries(cart.items).forEach(([productId, qty]) => {
    const product = state.products.find((item) => item.id === productId);
    if (product) {
      product.reserved = Math.max(0, product.reserved - qty);
    }
  });
}

function cleanupInactiveCarts() {
  state.carts.forEach((cart) => {
    if (isExpired(cart)) {
      releaseReservationsForCart(cart);
      state.carts.delete(cart.id);
    }
  });
}

function getCartOrThrow(cartId: string): Cart {
  cleanupInactiveCarts();

  const cart = state.carts.get(cartId);
  if (!cart) {
    throw new Error("Cart not found. Please start a new session.");
  }
  if (isExpired(cart)) {
    releaseReservationsForCart(cart);
    state.carts.delete(cart.id);
    throw new Error("Cart expired after inactivity. Please start a new session.");
  }
  return cart;
}

function touchCart(cart: Cart) {
  cart.lastActivityAt = now();
}

function toCartLines(cart: Cart): CartLine[] {
  return Object.entries(cart.items)
    .map(([productId, quantity]) => {
      const product = findProductOrThrow(productId);
      return {
        productId,
        name: product.name,
        quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents: product.priceCents * quantity,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function computeDiscounts(lines: CartLine[]): AppliedDiscount[] {
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const activeDiscounts = state.discounts.filter((discount) => discount.active);
  const applied: AppliedDiscount[] = [];

  activeDiscounts.forEach((discount) => {
    if (discount.type === "percentage_cart") {
      if ((discount.thresholdCents ?? 0) <= subtotalCents) {
        applied.push({
          discountId: discount.id,
          name: discount.name,
          amountCents: Math.round((subtotalCents * discount.value) / 100),
        });
      }
    }

    if (discount.type === "fixed_cart") {
      if ((discount.thresholdCents ?? 0) <= subtotalCents) {
        applied.push({
          discountId: discount.id,
          name: discount.name,
          amountCents: discount.value,
        });
      }
    }

    if (discount.type === "product_percentage" && discount.productId) {
      const matchingLine = lines.find((line) => line.productId === discount.productId);
      if (matchingLine) {
        applied.push({
          discountId: discount.id,
          name: discount.name,
          amountCents: Math.round((matchingLine.lineTotalCents * discount.value) / 100),
        });
      }
    }

    if (
      discount.type === "bulk_product" &&
      discount.productId &&
      typeof discount.minQuantity === "number"
    ) {
      const matchingLine = lines.find((line) => line.productId === discount.productId);
      if (matchingLine && matchingLine.quantity >= discount.minQuantity) {
        applied.push({
          discountId: discount.id,
          name: discount.name,
          amountCents: Math.round((matchingLine.lineTotalCents * discount.value) / 100),
        });
      }
    }
  });

  return applied;
}

if (process.env.NODE_ENV !== "test") {
  startCleanupTimer();
}

export const retailStore = {
  resetForTests() {
    state.products = cloneProductSeed();
    state.discounts = cloneDiscountSeed();
    state.carts.clear();
  },

  getCartTtlMs() {
    return CART_TTL_MS;
  },

  startSession() {
    cleanupInactiveCarts();
    const timestamp = now();
    const cart: Cart = {
      id: randomUUID(),
      items: {},
      createdAt: timestamp,
      lastActivityAt: timestamp,
    };
    state.carts.set(cart.id, cart);
    return { cartId: cart.id, expiresAt: cart.lastActivityAt + CART_TTL_MS };
  },

  listProducts() {
    cleanupInactiveCarts();
    return state.products.map((product) => ({
      ...product,
      availableStock: Math.max(0, product.stockOnHand - product.reserved),
    }));
  },

  getProduct(productId: string) {
    cleanupInactiveCarts();
    const product = findProductOrThrow(productId);
    return {
      ...product,
      availableStock: Math.max(0, product.stockOnHand - product.reserved),
    };
  },

  listDiscounts() {
    return state.discounts;
  },

  getDiscount(discountId: string) {
    const discount = state.discounts.find((item) => item.id === discountId);
    if (!discount) {
      throw new Error(`Discount not found: ${discountId}`);
    }
    return discount;
  },

  getCart(cartId: string): CartView {
    const cart = getCartOrThrow(cartId);
    touchCart(cart);
    const lines = toCartLines(cart);
    const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      cartId,
      itemCount,
      subtotalCents,
      lines,
      expiresAt: cart.lastActivityAt + CART_TTL_MS,
    };
  },

  setCartItem(cartId: string, productId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Quantity must be a non-negative integer.");
    }

    const cart = getCartOrThrow(cartId);
    const product = findProductOrThrow(productId);
    const currentQuantity = cart.items[productId] ?? 0;
    const delta = quantity - currentQuantity;

    if (delta > 0) {
      const availableStock = Math.max(0, product.stockOnHand - product.reserved);
      if (availableStock < delta) {
        throw new Error(
          `Insufficient stock for ${product.name}. Requested +${delta}, available ${availableStock}.`,
        );
      }
      product.reserved += delta;
    }

    if (delta < 0) {
      product.reserved = Math.max(0, product.reserved + delta);
    }

    if (quantity === 0) {
      delete cart.items[productId];
    } else {
      cart.items[productId] = quantity;
    }

    touchCart(cart);
    return this.getCart(cartId);
  },

  removeCartItem(cartId: string, productId: string) {
    const cart = getCartOrThrow(cartId);
    const product = findProductOrThrow(productId);
    const quantity = cart.items[productId] ?? 0;

    if (quantity > 0) {
      product.reserved = Math.max(0, product.reserved - quantity);
    }

    delete cart.items[productId];
    touchCart(cart);
    return this.getCart(cartId);
  },

  checkout(cartId: string): CheckoutResult {
    const cart = getCartOrThrow(cartId);
    touchCart(cart);
    const lines = toCartLines(cart);

    if (lines.length === 0) {
      const failure: CheckoutFailure = {
        success: false,
        reason: "Your cart is empty.",
      };
      return failure;
    }

    const stockIssues = lines
      .map((line) => {
        const product = findProductOrThrow(line.productId);
        const availableToPurchase = Math.max(0, product.stockOnHand);
        if (line.quantity > availableToPurchase) {
          return {
            productId: line.productId,
            requested: line.quantity,
            available: availableToPurchase,
          };
        }
        return null;
      })
      .filter((issue): issue is NonNullable<typeof issue> => issue !== null);

    if (stockIssues.length > 0) {
      releaseReservationsForCart(cart);
      state.carts.delete(cart.id);
      return {
        success: false,
        reason: "Some items are no longer in stock at the requested quantity.",
        stockIssues,
      };
    }

    const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const appliedDiscounts = computeDiscounts(lines);
    const discountTotalCents = Math.min(
      subtotalCents,
      appliedDiscounts.reduce((sum, discount) => sum + discount.amountCents, 0),
    );
    const totalCents = subtotalCents - discountTotalCents;

    lines.forEach((line) => {
      const product = findProductOrThrow(line.productId);
      product.stockOnHand = Math.max(0, product.stockOnHand - line.quantity);
      product.reserved = Math.max(0, product.reserved - line.quantity);
    });

    state.carts.delete(cart.id);

    return {
      success: true,
      orderId: `ord_${randomUUID().slice(0, 8)}`,
      cartId,
      subtotalCents,
      discountTotalCents,
      totalCents,
      lines,
      appliedDiscounts,
      purchasedAt: new Date().toISOString(),
    };
  },
};
