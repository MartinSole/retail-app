"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart-context";
import { ApiError, apiRequest } from "@/lib/api-client";
import { formatDate, formatMoney } from "@/lib/format";

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
};

type CheckoutSuccess = {
  success: true;
  orderId: string;
  cartId: string;
  subtotalCents: number;
  discountTotalCents: number;
  totalCents: number;
  lines: CartLine[];
  appliedDiscounts: Array<{
    discountId: string;
    name: string;
    amountCents: number;
  }>;
  purchasedAt: string;
};

type StockIssue = {
  productId: string;
  requested: number;
  available: number;
};

export default function CheckoutPage() {
  const { fetchCart, cartId, restartSession, refreshCartCount } = useCart();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);
  const [result, setResult] = useState<CheckoutSuccess | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      setLoading(true);
      setError(null);
      setStockIssues([]);
      try {
        const data = await fetchCart();
        if (mounted) {
          setCart(data);
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load cart for checkout.";
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

  async function handleCheckout() {
    if (!cartId) {
      setError("No active session found.");
      return;
    }

    setWorking(true);
    setError(null);
    setStockIssues([]);

    try {
      const order = await apiRequest<CheckoutSuccess>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartId }),
      });
      setResult(order);
      setCart(null);
      await restartSession();
      await refreshCartCount();
    } catch (checkoutError) {
      if (checkoutError instanceof ApiError) {
        setError(checkoutError.message);
        if (Array.isArray(checkoutError.details)) {
          setStockIssues(checkoutError.details as StockIssue[]);
        }
      } else {
        const message =
          checkoutError instanceof Error
            ? checkoutError.message
            : "Checkout failed unexpectedly.";
        setError(message);
      }
      await restartSession();
      await refreshCartCount();
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <p className="text-stone-700">Preparing checkout...</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Checkout</p>
        <h1 className="mt-2 text-4xl text-stone-900">Finalize Your Order</h1>
      </header>

      {error ? (
        <article className="rounded-2xl border border-red-700/20 bg-red-50 p-4 text-red-900">
          <p className="text-sm font-semibold">Checkout failed</p>
          <p className="text-sm">{error}</p>
          {stockIssues.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {stockIssues.map((issue) => (
                <li key={issue.productId}>
                  {issue.productId}: requested {issue.requested}, available {issue.available}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}

      {result ? (
        <article className="space-y-4 rounded-3xl border border-emerald-700/20 bg-emerald-50 p-6">
          <h2 className="text-2xl text-emerald-900">Order Confirmed</h2>
          <p className="text-sm text-emerald-900">Order ID: {result.orderId}</p>
          <p className="text-sm text-emerald-900">Purchased at: {formatDate(result.purchasedAt)}</p>

          <div className="space-y-2">
            {result.lines.map((line) => (
              <div key={line.productId} className="flex items-center justify-between text-sm text-emerald-950">
                <span>
                  {line.name} x{line.quantity}
                </span>
                <span>{formatMoney(line.lineTotalCents)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-emerald-900/20 pt-3 text-sm text-emerald-950">
            <p>Subtotal: {formatMoney(result.subtotalCents)}</p>
            <p>Discounts: -{formatMoney(result.discountTotalCents)}</p>
            <p className="text-lg font-semibold">Total: {formatMoney(result.totalCents)}</p>
          </div>

          {result.appliedDiscounts.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-emerald-900">Applied discounts</p>
              <ul className="mt-1 list-disc pl-5 text-xs text-emerald-950">
                {result.appliedDiscounts.map((discount) => (
                  <li key={discount.discountId}>
                    {discount.name}: -{formatMoney(discount.amountCents)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link href="/" className="inline-block rounded-full bg-stone-900 px-4 py-2 text-sm text-[#f9f5ef]">
            Continue Shopping
          </Link>
        </article>
      ) : (
        <article className="rounded-3xl border border-black/10 bg-[#fbf8f2] p-6">
          {!cart || cart.lines.length === 0 ? (
            <>
              <p className="text-stone-700">Your cart is empty.</p>
              <Link href="/" className="mt-3 inline-block rounded-full bg-stone-900 px-4 py-2 text-sm text-[#f9f5ef]">
                Browse Products
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-2">
                {cart.lines.map((line) => (
                  <div key={line.productId} className="flex items-center justify-between text-sm text-stone-800">
                    <span>
                      {line.name} x{line.quantity}
                    </span>
                    <span>{formatMoney(line.lineTotalCents)}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-lg text-stone-900">Subtotal: {formatMoney(cart.subtotalCents)}</p>
              <button
                type="button"
                disabled={working}
                onClick={handleCheckout}
                className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-[#f9f5ef] transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-500"
              >
                {working ? "Processing..." : "Confirm Checkout"}
              </button>
            </>
          )}
        </article>
      )}
    </section>
  );
}
