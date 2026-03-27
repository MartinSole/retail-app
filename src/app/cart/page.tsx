"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import { ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";

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

export default function CartPage() {
  const { fetchCart, setItemQuantity, removeItem } = useCart();
  const [cart, setCart] = useState<CartView | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const expiresIn = useMemo(() => {
    if (!cart || now === null) {
      return null;
    }
    const msRemaining = cart.expiresAt - now;
    const seconds = Math.max(0, Math.floor(msRemaining / 1000));
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }, [cart, now]);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCart();
        if (mounted) {
          setCart(data);
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load cart details.";
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCart();
    return () => {
      mounted = false;
    };
  }, [fetchCart]);

  async function updateQuantity(productId: string, quantity: number) {
    setNotice(null);
    setError(null);
    try {
      await setItemQuantity(productId, quantity);
      const latest = await fetchCart();
      setCart(latest);
      setNotice("Cart updated.");
    } catch (updateError) {
      const message =
        updateError instanceof ApiError
          ? updateError.message
          : updateError instanceof Error
            ? updateError.message
            : "Unable to update quantity.";
      setError(message);
    }
  }

  async function handleRemove(productId: string) {
    setNotice(null);
    setError(null);
    try {
      await removeItem(productId);
      const latest = await fetchCart();
      setCart(latest);
      setNotice("Item removed.");
    } catch (removeError) {
      const message =
        removeError instanceof ApiError
          ? removeError.message
          : removeError instanceof Error
            ? removeError.message
            : "Unable to remove item.";
      setError(message);
    }
  }

  if (loading) {
    return <p className="text-stone-700">Loading cart...</p>;
  }

  if (!cart) {
    return <p className="text-stone-700">Cart unavailable.</p>;
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
          Cart
        </p>
        <h1 className="text-4xl text-stone-900">Your Shopping Cart</h1>
        <p className="text-sm text-stone-600">
          Reserved stock expires after 2 minutes of inactivity. Time remaining:{" "}
          {expiresIn ?? "--"}
        </p>
      </header>

      {notice ? (
        <div className="rounded-xl border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {cart.lines.length === 0 ? (
        <article className="rounded-3xl border border-black/10 bg-[#f9f2e4] p-6">
          <p className="text-stone-700">Your cart is empty.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-stone-900 px-4 py-2 text-sm text-[#f9f5ef]"
          >
            Browse Guitars
          </Link>
        </article>
      ) : (
        <>
          <div className="space-y-3">
            {cart.lines.map((line) => (
              <article
                key={line.productId}
                className="grid gap-3 rounded-2xl border border-black/10 bg-[#fbf8f2] p-4 sm:grid-cols-[1.5fr_auto_auto] sm:items-center"
              >
                <div>
                  <h2 className="text-xl text-stone-900">{line.name}</h2>
                  <p className="text-sm text-stone-600">
                    Unit: {formatMoney(line.unitPriceCents)}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm text-stone-700">
                  Qty
                  <input
                    aria-label={`Quantity for ${line.name}`}
                    type="number"
                    min={0}
                    value={line.quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isInteger(value) && value >= 0) {
                        void updateQuantity(line.productId, value);
                      }
                    }}
                    className="w-20 rounded-lg border border-black/20 bg-white px-2 py-1"
                  />
                </label>

                <div className="flex items-center gap-3 justify-self-end">
                  <p className="text-lg font-semibold text-stone-900">
                    {formatMoney(line.lineTotalCents)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void handleRemove(line.productId);
                    }}
                    className="rounded-full border border-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-stone-700 transition hover:bg-black/10"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <footer className="rounded-3xl border border-black/10 bg-[#fff7ec] p-6">
            <p className="text-sm text-stone-600">Items: {cart.itemCount}</p>
            <p className="mt-1 text-3xl text-stone-900">
              Subtotal: {formatMoney(cart.subtotalCents)}
            </p>
            <Link
              href="/checkout"
              className="mt-4 inline-block rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-[#f9f5ef] transition hover:bg-black"
            >
              Continue to Checkout
            </Link>
          </footer>
        </>
      )}
    </section>
  );
}
