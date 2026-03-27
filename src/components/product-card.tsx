"use client";

import Link from "next/link";

import { formatMoney } from "@/lib/format";

export type ProductCardModel = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stockOnHand: number;
  reserved: number;
  availableStock: number;
};

type ProductCardProps = {
  product: ProductCardModel;
  onAddToCart: (productId: string) => Promise<void>;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const soldOut = product.availableStock <= 0;

  return (
    <article className="group rounded-3xl border border-black/10 bg-[#fcfaf7] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">Guitar</p>
      <h3 className="mt-2 text-2xl leading-tight text-stone-900">{product.name}</h3>
      <p className="mt-2 min-h-14 text-sm leading-relaxed text-stone-600">{product.description}</p>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-stone-900">{formatMoney(product.priceCents)}</p>
          <p className="text-xs text-stone-500">In stock now: {product.availableStock}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          disabled={soldOut}
          onClick={() => onAddToCart(product.id)}
          className="flex-1 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-[#f9f5ef] transition hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {soldOut ? "Sold Out" : "Add to Cart"}
        </button>
        <Link
          href={`/products/${product.id}`}
          className="rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-black/10"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
