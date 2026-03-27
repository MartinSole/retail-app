"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart-context";
import { ApiError, apiRequest } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stockOnHand: number;
  reserved: number;
  availableStock: number;
};

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest<ProductDetails>(`/api/products/${params.id}`);
        if (mounted) {
          setProduct(result);
        }
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to fetch product details.";
        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function handleAdd() {
    if (!product) {
      return;
    }
    setNotice(null);
    setError(null);
    try {
      await addItem(product.id, 1);
      const latest = await apiRequest<ProductDetails>(`/api/products/${params.id}`);
      setProduct(latest);
      setNotice("Item added to cart.");
    } catch (addError) {
      const message =
        addError instanceof ApiError
          ? addError.message
          : addError instanceof Error
            ? addError.message
            : "Unable to add to cart.";
      setError(message);
    }
  }

  if (loading) {
    return <p className="text-stone-700">Loading product details...</p>;
  }

  if (error || !product) {
    return (
      <section className="space-y-4 rounded-3xl border border-red-700/20 bg-red-50 p-6">
        <h1 className="text-2xl text-red-900">Product unavailable</h1>
        <p className="text-sm text-red-800">{error ?? "Product not found."}</p>
        <Link href="/" className="inline-block rounded-full bg-stone-900 px-4 py-2 text-sm text-[#f9f5ef]">
          Back to Catalogue
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link href="/" className="text-sm font-semibold uppercase tracking-[0.1em] text-stone-700">
        Back to catalogue
      </Link>

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

      <article className="grid gap-6 rounded-3xl border border-black/10 bg-[#fbf8f2] p-6 shadow-sm sm:grid-cols-[1.4fr_1fr] sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Gibson Electric</p>
          <h1 className="mt-3 text-4xl leading-tight text-stone-900">{product.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-stone-700">{product.description}</p>
          <p className="mt-6 text-sm text-stone-500">Product ID: {product.id}</p>
        </div>

        <aside className="rounded-2xl bg-[#fff3e4] p-5">
          <p className="text-3xl font-semibold text-stone-900">{formatMoney(product.priceCents)}</p>
          <p className="mt-2 text-sm text-stone-700">Available stock: {product.availableStock}</p>
          <p className="mt-1 text-xs text-stone-500">Reserved in active carts: {product.reserved}</p>
          <button
            type="button"
            disabled={product.availableStock <= 0}
            onClick={handleAdd}
            className="mt-6 w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#f9f5ef] transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {product.availableStock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </aside>
      </article>
    </section>
  );
}
