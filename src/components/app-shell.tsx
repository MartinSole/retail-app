"use client";

import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#f4bd59_0%,transparent_30%),radial-gradient(circle_at_bottom_right,#6ca7a6_0%,transparent_40%),linear-gradient(165deg,#f6f0e5_0%,#efe4d2_45%,#f9f5ee_100%)]" />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      </div>
    </CartProvider>
  );
}
