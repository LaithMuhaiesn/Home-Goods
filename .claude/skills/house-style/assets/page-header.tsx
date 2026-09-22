// House page-header template. Copy this into components/PageHeader.tsx (or use
// the existing one) and render it at the top of every page — list, detail, and
// error pages included. Do not re-invent the structure per page.
//
// Contract: an uppercase, letter-spaced eyebrow naming the section; an <h1>;
// one muted sentence underneath.

export type PageHeaderProps = {
  eyebrow: string; // e.g. "CATEGORY" — rendered uppercase + letter-spaced via CSS
  title: string; // the page's <h1>
  lede: string; // one muted sentence of context
};

export default function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  return (
    <header className="page-header" data-testid="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
    </header>
  );
}
