import type { Product } from "@/data/catalog";

/**
 * Filter a category's products by a free-text query. Case-insensitive, ignores
 * leading/trailing whitespace, and matches against a product's name or
 * description. An empty or whitespace-only query returns every product.
 */
export function filterProducts(products: Product[], q: string): Product[] {
  const needle = q.trim().toLowerCase();
  if (needle === "") {
    return products;
  }
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(needle) ||
      product.description.toLowerCase().includes(needle),
  );
}
