import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import StatePanel, { isPanelState } from "@/components/StatePanel";
import { getCategory } from "@/data/catalog";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ demoState?: string }>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { demoState } = await searchParams;

  const category = getCategory(slug);
  if (!category) {
    notFound();
  }

  const state = isPanelState(demoState) ? demoState : "success";
  const href = `/category/${category.slug}`;

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        lede={category.blurb}
      />
      <StatePanel state={state} retryHref={href} subject="products">
        <ul className="grid">
          {category.products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ul>
      </StatePanel>
    </>
  );
}
