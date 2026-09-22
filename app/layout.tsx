import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import CartIndicator from "@/components/CartIndicator";

export const metadata: Metadata = {
  title: "Home Goods — Storefront",
  description: "A small storefront vertical slice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/category/home-goods" className="site-brand">
            Home Goods
          </Link>
          <CartIndicator />
        </header>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
