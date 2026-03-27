import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ApiError, apiRequest } from "./api";
import type {
  CartView,
  CheckoutSuccess,
  Discount,
  Product,
  StockIssue,
} from "./types";

type RetailContextValue = {
  loading: boolean;
  checkingOut: boolean;
  error: string | null;
  notice: string | null;
  products: Product[];
  discounts: Discount[];
  cart: CartView | null;
  checkoutResult: CheckoutSuccess | null;
  stockIssues: StockIssue[];
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  checkout: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

const RetailContext = createContext<RetailContextValue | null>(null);

export function RetailProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutSuccess | null>(null);
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);

  async function startSession() {
    const session = await apiRequest<{ cartId: string }>("/api/session", {
      method: "POST",
    });
    setCartId(session.cartId);
    return session.cartId;
  }

  async function fetchProductsAndDiscounts() {
    const [productData, discountData] = await Promise.all([
      apiRequest<Product[]>("/api/products"),
      apiRequest<Discount[]>("/api/discounts"),
    ]);
    setProducts(productData);
    setDiscounts(discountData.filter((discount) => discount.active));
  }

  async function fetchCartData(activeCartId: string) {
    const cartData = await apiRequest<CartView>(`/api/cart?cartId=${activeCartId}`);
    setCart(cartData);
  }

  async function refreshAll(activeCartId?: string) {
    const currentCartId = activeCartId ?? cartId ?? (await startSession());
    await Promise.all([fetchProductsAndDiscounts(), fetchCartData(currentCartId)]);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setLoading(true);
        const createdCartId = await startSession();
        await refreshAll(createdCartId);
      } catch (initError) {
        if (!mounted) {
          return;
        }
        setError(initError instanceof Error ? initError.message : "Failed to load app state.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  async function addToCart(productId: string) {
    if (!cartId) {
      return;
    }
    setError(null);
    setNotice(null);

    try {
      const existing = cart?.lines.find((line) => line.productId === productId);
      const nextQuantity = (existing?.quantity ?? 0) + 1;

      await apiRequest<CartView>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ cartId, productId, quantity: nextQuantity }),
      });

      await refreshAll();
      setNotice("Item added to cart.");
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Could not add item.");
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (!cartId) {
      return;
    }
    setError(null);
    setNotice(null);

    try {
      await apiRequest<CartView>("/api/cart/items", {
        method: "PATCH",
        body: JSON.stringify({ cartId, productId, quantity }),
      });
      await refreshAll();
      setNotice("Cart updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update cart item.");
    }
  }

  async function removeItem(productId: string) {
    if (!cartId) {
      return;
    }
    setError(null);
    setNotice(null);

    try {
      await apiRequest<CartView>(
        `/api/cart/items?cartId=${encodeURIComponent(cartId)}&productId=${encodeURIComponent(productId)}`,
        { method: "DELETE" },
      );
      await refreshAll();
      setNotice("Item removed.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove item.");
    }
  }

  async function checkout() {
    if (!cartId) {
      return;
    }

    setCheckingOut(true);
    setError(null);
    setNotice(null);
    setStockIssues([]);

    try {
      const result = await apiRequest<CheckoutSuccess>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartId }),
      });

      setCheckoutResult(result);
      setNotice("Checkout successful.");
      const newCartId = await startSession();
      await refreshAll(newCartId);
    } catch (checkoutError) {
      if (checkoutError instanceof ApiError) {
        setError(checkoutError.message);
        if (Array.isArray(checkoutError.details)) {
          setStockIssues(checkoutError.details as StockIssue[]);
        }
      } else {
        setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
      }

      const newCartId = await startSession();
      await refreshAll(newCartId);
    } finally {
      setCheckingOut(false);
    }
  }

  const value = useMemo(
    () => ({
      loading,
      checkingOut,
      error,
      notice,
      products,
      discounts,
      cart,
      checkoutResult,
      stockIssues,
      addToCart,
      updateQuantity,
      removeItem,
      checkout,
      refreshAll: async () => refreshAll(),
    }),
    [
      loading,
      checkingOut,
      error,
      notice,
      products,
      discounts,
      cart,
      checkoutResult,
      stockIssues,
    ],
  );

  return <RetailContext.Provider value={value}>{children}</RetailContext.Provider>;
}

export function useRetail() {
  const context = useContext(RetailContext);
  if (!context) {
    throw new Error("useRetail must be used within RetailProvider.");
  }

  return context;
}
