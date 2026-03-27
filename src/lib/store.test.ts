/** @jest-environment node */

import { retailStore } from "@/lib/store";

describe("retailStore", () => {
  beforeEach(() => {
    retailStore.resetForTests();
  });

  it("creates a session and exposes an empty cart", () => {
    const session = retailStore.startSession();
    const cart = retailStore.getCart(session.cartId);

    expect(cart.itemCount).toBe(0);
    expect(cart.lines).toHaveLength(0);
  });

  it("reserves stock and decrements stock on successful checkout", () => {
    const productId = "gibson-sg-standard";
    const initialProduct = retailStore.getProduct(productId);

    const session = retailStore.startSession();
    retailStore.setCartItem(session.cartId, productId, 2);
    const reservedProduct = retailStore.getProduct(productId);

    expect(reservedProduct.reserved).toBe(2);

    const result = retailStore.checkout(session.cartId);
    expect(result.success).toBe(true);

    const afterCheckout = retailStore.getProduct(productId);
    expect(afterCheckout.stockOnHand).toBe(initialProduct.stockOnHand - 2);
    expect(afterCheckout.reserved).toBe(0);
  });

  it("returns actionable failure when stock is insufficient", () => {
    const productId = "gibson-flying-v";
    const sessionA = retailStore.startSession();
    const sessionB = retailStore.startSession();

    retailStore.setCartItem(sessionA.cartId, productId, 4);
    expect(() => retailStore.setCartItem(sessionB.cartId, productId, 1)).toThrow(
      "Insufficient stock",
    );
  });

  it("applies configured discounts at checkout", () => {
    const session = retailStore.startSession();
    retailStore.setCartItem(session.cartId, "gibson-sg-standard", 2);

    const result = retailStore.checkout(session.cartId);
    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected successful checkout.");
    }

    expect(result.appliedDiscounts.length).toBeGreaterThan(0);
    expect(result.discountTotalCents).toBeGreaterThan(0);
    expect(result.totalCents).toBe(result.subtotalCents - result.discountTotalCents);
  });
});
