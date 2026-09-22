import Image from "next/image";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatePanel, { isPanelState } from "@/components/StatePanel";
import { getProduct } from "@/data/catalog";
import { money, date } from "@/lib/format";
import { getPhoto } from "@/lib/unsplash";

// Depends on runtime env (the key) and an external request, so it must not be
// prerendered at build time — that would fire a real Unsplash call during
// `next build`.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ demoState?: string }>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { demoState } = await searchParams;

  const found = getProduct(slug);
  if (!found) {
    notFound();
  }

  const { product, category } = found;
  const state = isPanelState(demoState) ? demoState : "success";
  const href = `/product/${product.slug}`;

  const photo = state === "success" ? await getPhoto(product.imageQuery) : null;

  return (
    <>
      <PageHeader
        eyebrow={category.name}
        title={product.name}
        lede={product.description}
      />
      <StatePanel state={state} retryHref={href} subject="this product">
        <div className="detail" data-testid="product-detail">
          <div>
            {photo && photo.ok ? (
              <>
                <Image
                  src={photo.photo.url}
                  alt={photo.photo.alt}
                  width={photo.photo.width}
                  height={photo.photo.height}
                />
                <p className="attribution">
                  Photo by{" "}
                  <a href={photo.photo.photographer.url}>
                    {photo.photo.photographer.name}
                  </a>{" "}
                  on <a href={photo.photo.unsplashUrl}>Unsplash</a>
                </p>
              </>
            ) : (
              <div className="photo-fallback">
                <p>Photo unavailable right now.</p>
                <p className="muted">
                  The product details below are unaffected.
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="price" style={{ fontSize: "22px" }}>
              {money(product.priceEUR)}
            </p>
            <dl className="facts">
              <dt>Added</dt>
              <dd>{date(product.addedAt)}</dd>
              <dt>Category</dt>
              <dd>{category.name}</dd>
            </dl>
          </div>
        </div>
      </StatePanel>
    </>
  );
}
