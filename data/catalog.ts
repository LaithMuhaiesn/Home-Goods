export type Product = {
  slug: string;
  name: string;
  priceEUR: number;
  description: string;
  imageQuery: string;
  addedAt: string;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  products: Product[];
};

export const catalog: Category[] = [
  {
    slug: "home-goods",
    name: "Home Goods",
    blurb: "Well-made things for everyday rooms, chosen to last.",
    products: [
      {
        slug: "linen-desk-lamp",
        name: "Linen Desk Lamp",
        priceEUR: 89,
        description: "A warm task lamp with a woven linen shade and a brass stem.",
        imageQuery: "linen desk lamp",
        addedAt: "2026-09-01",
      },
      {
        slug: "ceramic-table-vase",
        name: "Ceramic Table Vase",
        priceEUR: 42.5,
        description: "A hand-thrown stoneware vase with a soft matte glaze.",
        imageQuery: "ceramic table vase",
        addedAt: "2026-09-05",
      },
      {
        slug: "oak-storage-bench",
        name: "Oak Storage Bench",
        priceEUR: 245,
        description: "A solid oak entry bench with a lift-top storage compartment.",
        imageQuery: "oak storage bench",
        addedAt: "2026-09-10",
      },
      {
        slug: "wool-throw-blanket",
        name: "Wool Throw Blanket",
        priceEUR: 68,
        description: "A lambswool throw with a fringed edge, woven in a herringbone weave.",
        imageQuery: "wool throw blanket",
        addedAt: "2026-09-15",
      },
    ],
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    blurb: "Tools and tableware that earn their place on the counter.",
    products: [
      {
        slug: "cast-iron-skillet",
        name: "Cast-Iron Skillet",
        priceEUR: 54,
        description: "A pre-seasoned 26 cm skillet that moves from hob to oven.",
        imageQuery: "cast iron skillet",
        addedAt: "2026-09-02",
      },
      {
        slug: "walnut-cutting-board",
        name: "Walnut Cutting Board",
        priceEUR: 39.5,
        description: "An end-grain walnut board with hand-cut finger grips.",
        imageQuery: "walnut cutting board",
        addedAt: "2026-09-06",
      },
      {
        slug: "stoneware-mixing-bowls",
        name: "Stoneware Mixing Bowls",
        priceEUR: 48,
        description: "A nesting set of three glazed stoneware bowls.",
        imageQuery: "stoneware mixing bowls",
        addedAt: "2026-09-09",
      },
      {
        slug: "copper-measuring-cups",
        name: "Copper Measuring Cups",
        priceEUR: 32,
        description: "Four polished copper cups on a leather hanging loop.",
        imageQuery: "copper measuring cups",
        addedAt: "2026-09-12",
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return catalog.find((category) => category.slug === slug);
}

export function getProduct(
  slug: string,
): { product: Product; category: Category } | undefined {
  for (const category of catalog) {
    const product = category.products.find((p) => p.slug === slug);
    if (product) {
      return { product, category };
    }
  }
  return undefined;
}
