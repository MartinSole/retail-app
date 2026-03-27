"use client";

import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart-context";
import { ProductCard, type ProductCardModel } from "@/components/product-card";
import { ApiError, apiRequest } from "@/lib/api-client";

type Discount = {
  id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
};

export default function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductCardModel[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [productData, discountData] = await Promise.all([
          apiRequest<ProductCardModel[]>("/api/products"),
          apiRequest<Discount[]>("/api/discounts"),
        ]);
        if (!mounted) {
          return;
        }
        setProducts(productData);
        setDiscounts(discountData.filter((discount) => discount.active));
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load catalogue.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const inStockCount = useMemo(
    () => products.filter((product) => product.availableStock > 0).length,
    [products],
  );

  async function handleAddToCart(productId: string) {
    setNotice(null);
    setError(null);
    try {
      await addItem(productId, 1);
      setNotice("Added to cart.");
      const latestProducts = await apiRequest<ProductCardModel[]>("/api/products");
      setProducts(latestProducts);
    } catch (addError) {
      const message =
        addError instanceof ApiError
          ? addError.message
          : addError instanceof Error
            ? addError.message
            : "Unable to add item to cart.";
      setError(message);
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-black/10 bg-[linear-gradient(130deg,rgba(14,22,27,0.97),rgba(35,49,56,0.9)),url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center p-8 text-[#f9f5ef] shadow-lg sm:p-10">
        <p className="text-sm uppercase tracking-[0.18em] text-amber-300">Retail App Exercise</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Gibson Retail Experience</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#d9d4ca] sm:text-base">
          Browse Gibson guitars, reserve stock through your active cart, and run a complete checkout
          flow with automatic discounting and reservation expiry.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-[#f4ead7]">
          <span className="rounded-full bg-white/10 px-3 py-1">Products: {products.length}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">In stock: {inStockCount}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Active discounts: {discounts.length}</span>
        </div>
      </div>

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

      <section className="grid gap-4 rounded-3xl border border-black/10 bg-[#f6efe4] p-5 sm:grid-cols-2 lg:grid-cols-4">
        {discounts.map((discount) => (
          <article key={discount.id} className="rounded-2xl bg-[#fff7ec] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-500">{discount.type}</p>
            <h2 className="mt-2 text-lg text-stone-900">{discount.name}</h2>
            <p className="mt-2 text-sm text-stone-600">{discount.description}</p>
          </article>
        ))}
      </section>

      {loading ? (
        <p className="text-stone-700">Loading products...</p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </section>
      )}
    </section>
  );
}
