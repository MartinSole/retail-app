import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import Script from "next/script";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const headingFont = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gibson Retail App",
  description:
    "Retail shopping experience with in-memory stock reservations and checkout.",
};

const stripInjectedRootAttrsScript = `
(() => {
  const cleanup = () => {
    const targets = [document.documentElement, document.body];
    for (const element of targets) {
      if (!element) continue;
      const attrs = Array.from(element.attributes);
      for (const attr of attrs) {
        if (attr.name === "screen_capture_injected" || attr.name.endsWith("_injected")) {
          element.removeAttribute(attr.name);
        }
      }
    }
  };

  cleanup();
  document.addEventListener("DOMContentLoaded", cleanup, { once: true });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {process.env.NODE_ENV === "development" ? (
          <Script id="strip-injected-root-attrs" strategy="beforeInteractive">
            {stripInjectedRootAttrsScript}
          </Script>
        ) : null}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
