"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError, apiRequest } from "@/lib/api-client";

type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type CartView = {
  cartId: string;
  itemCount: number;
  subtotalCents: number;
  lines: CartLine[];
  expiresAt: number;
};

type CartSession = {
  cartId: string;
  expiresAt: number;
};

type CartContextValue = {
  cartId: string | null;
  cartCount: number;
  initializing: boolean;
  ensureSession: () => Promise<string>;
  refreshCartCount: () => Promise<number>;
  fetchCart: () => Promise<CartView>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  restartSession: () => Promise<string>;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "gibson-retail-cart-id";

async function createSession(): Promise<CartSession> {
  return apiRequest<CartSession>("/api/session", {
    method: "POST",
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [initializing, setInitializing] = useState(true);

  const saveCartId = useCallback((nextCartId: string) => {
    localStorage.setItem(STORAGE_KEY, nextCartId);
    setCartId(nextCartId);
  }, []);

  const restartSession = useCallback(async () => {
    const session = await createSession();
    saveCartId(session.cartId);
    setCartCount(0);
    return session.cartId;
  }, [saveCartId]);

  const ensureSession = useCallback(async () => {
    if (cartId) {
      return cartId;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCartId(stored);
      return stored;
    }

    return restartSession();
  }, [cartId, restartSession]);

  const refreshCartCount = useCallback(async () => {
    const activeCartId = await ensureSession();
    try {
      const cart = await apiRequest<CartView>(`/api/cart?cartId=${activeCartId}`);
      setCartCount(cart.itemCount);
      return cart.itemCount;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const newCartId = await restartSession();
        const cart = await apiRequest<CartView>(`/api/cart?cartId=${newCartId}`);
        setCartCount(cart.itemCount);
        return cart.itemCount;
      }
      throw error;
    }
  }, [ensureSession, restartSession]);

  const fetchCart = useCallback(async () => {
    const activeCartId = await ensureSession();
    try {
      const cart = await apiRequest<CartView>(`/api/cart?cartId=${activeCartId}`);
      setCartCount(cart.itemCount);
      return cart;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        const newCartId = await restartSession();
        return apiRequest<CartView>(`/api/cart?cartId=${newCartId}`);
      }
      throw error;
    }
  }, [ensureSession, restartSession]);

  const setItemQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const activeCartId = await ensureSession();
      await apiRequest<CartView>("/api/cart/items", {
        method: "PATCH",
        body: JSON.stringify({ cartId: activeCartId, productId, quantity }),
      });
      await refreshCartCount();
    },
    [ensureSession, refreshCartCount],
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      if (quantity <= 0) {
        return;
      }
      const cart = await fetchCart();
      const existing = cart.lines.find((line) => line.productId === productId);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;

      await apiRequest<CartView>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({
          cartId: cart.cartId,
          productId,
          quantity: nextQuantity,
        }),
      });

      await refreshCartCount();
    },
    [fetchCart, refreshCartCount],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const activeCartId = await ensureSession();
      await apiRequest<CartView>(
        `/api/cart/items?cartId=${activeCartId}&productId=${productId}`,
        {
          method: "DELETE",
        },
      );
      await refreshCartCount();
    },
    [ensureSession, refreshCartCount],
  );

  useEffect(() => {
    let mounted = true;

    async function initializeCart() {
      try {
        await refreshCartCount();
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    initializeCart();

    return () => {
      mounted = false;
    };
  }, [refreshCartCount]);

  const value = useMemo(
    () => ({
      cartId,
      cartCount,
      initializing,
      ensureSession,
      refreshCartCount,
      fetchCart,
      addItem,
      setItemQuantity,
      removeItem,
      restartSession,
    }),
    [
      addItem,
      cartCount,
      cartId,
      ensureSession,
      fetchCart,
      initializing,
      refreshCartCount,
      removeItem,
      restartSession,
      setItemQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
