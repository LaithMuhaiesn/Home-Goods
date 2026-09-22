import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Not found"
        title="We couldn't find that page"
        lede="The category or product you asked for doesn't exist in this catalogue."
      />
      <Link className="btn" href="/category/home-goods">
        Back to Home Goods
      </Link>
    </>
  );
}
