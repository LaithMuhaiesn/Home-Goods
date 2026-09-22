import Link from "next/link";
import type { Product } from "@/data/catalog";
import { money } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <li>
      <Link
        className="card"
        href={`/product/${product.slug}`}
        data-testid="product-card"
      >
        <h2>{product.name}</h2>
        <p className="price">{money(product.priceEUR)}</p>
        <p className="muted">{product.description}</p>
      </Link>
    </li>
  );
}
