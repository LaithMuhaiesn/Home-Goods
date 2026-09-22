export type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lede: string;
};

/**
 * The house page-header block. Every page opens with this: an uppercase,
 * letter-spaced eyebrow naming the section, an <h1>, and one muted sentence.
 */
export default function PageHeader({ eyebrow, title, lede }: PageHeaderProps) {
  return (
    <header className="page-header" data-testid="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
    </header>
  );
}
