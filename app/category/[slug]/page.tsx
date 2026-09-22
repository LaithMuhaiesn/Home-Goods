import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import CategorySearch from "@/components/CategorySearch";
import StatePanel, { isPanelState } from "@/components/StatePanel";
import { getCategory } from "@/data/catalog";
import { filterProducts } from "@/lib/search";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ demoState?: string; q?: string }>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { demoState, q } = await searchParams;

  const category = getCategory(slug);
  if (!category) {
    notFound();
  }

  const href = `/category/${category.slug}`;

  // The test-only demoState hook overrides everything else (default: success).
  const demo = isPanelState(demoState) ? demoState : "success";
  if (demo !== "success") {
    return (
      <>
        <PageHeader
          eyebrow="Category"
          title={category.name}
          lede={category.blurb}
        />
        <StatePanel state={demo} retryHref={href} subject="products" />
      </>
    );
  }

  const query = (q ?? "").trim();
  const isFiltering = query !== "";
  const results = filterProducts(category.products, query);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        lede={category.blurb}
      />
      <CategorySearch placeholder={`Search ${category.name}…`} />
      {isFiltering && (
        <p className="muted" aria-live="polite" data-testid="result-count">
          {results.length} {results.length === 1 ? "result" : "results"} for
          &ldquo;{query}&rdquo;
        </p>
      )}
      {results.length > 0 ? (
        <StatePanel state="success" retryHref={href} subject="products">
          <ul className="grid">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ul>
        </StatePanel>
      ) : (
        <StatePanel
          state="empty"
          retryHref={href}
          subject="products"
          emptyTitle="No matches"
          emptyBody={`No products in ${category.name} match “${query}”.`}
          actionLabel="Clear search"
        />
      )}
    </>
  );
}
