"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-context";

const NAV_ITEMS = [
  { href: "/", label: "Catalogue" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[rgba(250,246,239,0.88)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-3xl leading-none tracking-[0.08em] text-stone-900">
          GIBSON VAULT
        </Link>

        <nav className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-stone-900 text-[#f9f5ef]"
                    : "bg-transparent text-stone-700 hover:bg-black/10"
                }`}
              >
                {item.label}
                {item.href === "/cart" ? ` (${cartCount})` : ""}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
