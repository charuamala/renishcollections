/**
 * Owner-supplied products, kept as data so they can be re-applied to any
 * environment. Safe to re-run: products and variants are upserted by
 * slug/SKU and each product's images are replaced with the list below.
 * Day-to-day edits (price, stock, copy) belong in Admin → Products.
 *
 *   npm run db:catalog
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CatalogColour {
  name: string;
  skuSuffix: string;
  stock: number;
  /** File names (in the product's image folder) that show this colour. */
  images: { file: string; view: "worn" | "draped" }[];
}

interface CatalogProduct {
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  imageFolder: string;
  shortDescription: string;
  description: string;
  fabric: string;
  blouseIncluded: boolean;
  sellingPrice: number;
  /** Equal to sellingPrice when there is no discount to show. */
  originalPrice: number;
  tags: string[];
  isNewArrival: boolean;
  isFeatured: boolean;
  /** Colour options (variants). Leave empty for a single-colour saree and use the fields below. */
  colours: CatalogColour[];
  /** Single-colour sarees only. */
  colour?: string;
  stock?: number;
  images?: { file: string; view: "worn" | "draped" }[];
}

const PRODUCTS: CatalogProduct[] = [
  {
    slug: "banarasi-dupion-soft-silk-saree-meenakari-border",
    sku: "RC-DUP-0001",
    name: "Banarasi Dupion Soft Silk Saree with Meenakari Border",
    categorySlug: "dupion-silk",
    imageFolder: "/images/products/banarasi-dupion-soft-silk",
    shortDescription:
      "Banarasi dupion soft silk with zari butti woven all over, a contrast Alfi meenakari border, a contrast woven pallu and a contrast blouse piece.",
    description: [
      "A trending Banarasi dupion soft silk saree, woven with delicate zari butti across the body and finished with a fancy contrast Alfi meenakari design in the border.",
      "",
      "• Fabric: Banarasi dupion soft silk",
      "• Body: zari butti weaving across the full saree",
      "• Border: contrast Alfi meenakari design",
      "• Pallu: contrast weaving",
      "• Blouse: contrast blouse piece included",
      "• Available in 11 colour combinations",
    ].join("\n"),
    fabric: "Banarasi Dupion Soft Silk",
    blouseIncluded: true,
    sellingPrice: 1099,
    originalPrice: 1099,
    tags: ["banarasi", "dupion silk", "soft silk", "zari butti", "meenakari border", "contrast pallu", "trending"],
    isNewArrival: true,
    isFeatured: true,
    colours: [
      {
        name: "Navy Blue & Sky Blue",
        skuSuffix: "NVY",
        stock: 50,
        images: [
          { file: "01-navy-sky-blue-model.jpg", view: "worn" },
          { file: "02-navy-sky-blue-drape.jpg", view: "draped" },
        ],
      },
      {
        name: "Maroon & Pink",
        skuSuffix: "MRN",
        stock: 50,
        images: [{ file: "03-maroon-pink-drape.jpg", view: "draped" }],
      },
      {
        name: "Lavender & Purple",
        skuSuffix: "LAV",
        stock: 50,
        images: [
          { file: "04-lavender-purple-model.jpg", view: "worn" },
          { file: "05-lavender-purple-drape.jpg", view: "draped" },
        ],
      },
      {
        name: "Orange & Peach",
        skuSuffix: "ORP",
        stock: 50,
        images: [{ file: "06-orange-peach-drape.jpg", view: "draped" }],
      },
      {
        name: "Mint Green & Lime",
        skuSuffix: "MNT",
        stock: 50,
        images: [{ file: "07-mint-lime-drape.jpg", view: "draped" }],
      },
      {
        name: "Purple & Grey",
        skuSuffix: "PGY",
        stock: 50,
        images: [
          { file: "08-purple-grey-model.jpg", view: "worn" },
          { file: "09-purple-grey-drape.jpg", view: "draped" },
        ],
      },
      {
        name: "Purple & Aqua",
        skuSuffix: "PAQ",
        stock: 50,
        images: [{ file: "10-purple-aqua-drape.jpg", view: "draped" }],
      },
      {
        name: "Purple & Cream",
        skuSuffix: "PCR",
        stock: 50,
        images: [{ file: "11-purple-cream-drape.jpg", view: "draped" }],
      },
      {
        name: "Bottle Green & Grey",
        skuSuffix: "GGY",
        stock: 50,
        images: [{ file: "12-green-grey-drape.jpg", view: "draped" }],
      },
      {
        name: "Royal Blue & Pink",
        skuSuffix: "RBP",
        stock: 50,
        images: [{ file: "13-royal-blue-pink-drape.jpg", view: "draped" }],
      },
      {
        name: "Orange & Lavender",
        skuSuffix: "OLV",
        stock: 50,
        images: [
          { file: "14-orange-lavender-model.jpg", view: "worn" },
          { file: "15-orange-lavender-drape.jpg", view: "draped" },
        ],
      },
    ],
  },
  {
    slug: "banarasi-katan-soft-silk-saree-ghungroo-work",
    sku: "RC-KAT-0001",
    name: "Banarasi Katan Soft Silk Saree with Ghungroo Work",
    categorySlug: "katan-silk",
    imageFolder: "/images/products/banarasi-katan-soft-silk-ghungroo",
    shortDescription:
      "Banarasi katan soft silk with zari butti woven across the body, a fancy designer border, ghungroo work, and a contrast zari pallu and blouse piece.",
    description: [
      "A Banarasi katan soft silk saree with ghungroo work, woven with zari butti across the full body and finished with a fancy designer border.",
      "",
      "• Fabric: Banarasi katan soft silk",
      "• Body: full zari butti weaving",
      "• Border: fancy designer border",
      "• Details: ghungroo work",
      "• Pallu: contrast zari pallu",
      "• Blouse: contrast blouse piece included",
      "• Also available in other colours — message us on WhatsApp",
    ].join("\n"),
    fabric: "Banarasi Katan Soft Silk",
    blouseIncluded: true,
    sellingPrice: 1099,
    originalPrice: 1099,
    tags: ["banarasi", "katan silk", "soft silk", "zari butti", "ghungroo work", "designer border", "contrast pallu"],
    isNewArrival: true,
    isFeatured: true,
    colours: [],
    colour: "Wine",
    stock: 50,
    images: [
      { file: "01-wine-drape.jpg", view: "draped" },
      { file: "02-wine-with-blouse-piece.jpg", view: "draped" },
    ],
  },
  {
    slug: "banarasi-dupion-soft-silk-saree-running-pallu",
    sku: "RC-DUP-0002",
    name: "Banarasi Dupion Soft Silk Saree with Running Pallu",
    categorySlug: "dupion-silk",
    imageFolder: "/images/products/banarasi-dupion-soft-silk-running-pallu",
    shortDescription:
      "Banarasi dupion soft silk with zari butti woven across the full saree, a contrast Alfi meenakari border, a contrast running pallu with chit pallu, and a contrast running blouse.",
    description: [
      "A Banarasi dupion soft silk saree with beautiful zari butti weaving across the full saree and a fancy contrast Alfi meenakari design in the border.",
      "",
      "• Fabric: Banarasi dupion soft silk",
      "• Body: zari butti weaving across the full saree",
      "• Border: contrast Alfi meenakari design",
      "• Pallu: contrast running pallu with chit pallu",
      "• Blouse: contrast running blouse",
      "• Available in 8 colour combinations",
    ].join("\n"),
    fabric: "Banarasi Dupion Soft Silk",
    blouseIncluded: true,
    sellingPrice: 1050,
    originalPrice: 1050,
    tags: [
      "banarasi",
      "dupion silk",
      "soft silk",
      "zari butti",
      "meenakari border",
      "running pallu",
      "chit pallu",
      "trending",
    ],
    isNewArrival: true,
    isFeatured: true,
    colours: [
      {
        name: "Mustard Yellow & Brown",
        skuSuffix: "MUS",
        stock: 50,
        images: [{ file: "01-mustard-brown.jpg", view: "draped" }],
      },
      {
        name: "Parrot Green & Bottle Green",
        skuSuffix: "PGR",
        stock: 50,
        images: [{ file: "02-parrot-green-bottle-green.jpg", view: "draped" }],
      },
      {
        name: "Crimson & Pink",
        skuSuffix: "CRP",
        stock: 50,
        images: [{ file: "03-crimson-pink.jpg", view: "draped" }],
      },
      {
        name: "Navy Blue & Steel Blue",
        skuSuffix: "NSB",
        stock: 50,
        images: [{ file: "04-navy-steel-blue.jpg", view: "draped" }],
      },
      {
        name: "Magenta & Purple",
        skuSuffix: "MGP",
        stock: 50,
        images: [{ file: "05-magenta-purple.jpg", view: "draped" }],
      },
      {
        name: "Rani Pink & Wine",
        skuSuffix: "RPW",
        stock: 50,
        images: [{ file: "06-rani-pink-wine.jpg", view: "draped" }],
      },
      {
        name: "Purple & Lavender",
        skuSuffix: "PLV",
        stock: 50,
        images: [{ file: "07-purple-lavender.jpg", view: "draped" }],
      },
      { name: "Red", skuSuffix: "RED", stock: 50, images: [{ file: "08-red.jpg", view: "draped" }] },
    ],
  },
  {
    slug: "banarasi-warm-soft-silk-saree-meenakari-border",
    sku: "RC-WRM-0001",
    name: "Banarasi Warm Soft Silk Saree with Meenakari Border",
    categorySlug: "warm-silk",
    imageFolder: "/images/products/banarasi-warm-soft-silk",
    shortDescription:
      "Banarasi warm soft silk with zari butti woven across the full saree, a contrast Alfi meenakari border, a contrast woven pallu and a contrast blouse piece.",
    description: [
      "A Banarasi warm soft silk saree with beautiful zari butti weaving across the full saree and a fancy contrast Alfi meenakari design in the border.",
      "",
      "• Fabric: Banarasi warm soft silk",
      "• Body: zari butti weaving across the full saree",
      "• Border: contrast Alfi meenakari design",
      "• Pallu: contrast woven pallu",
      "• Blouse: contrast blouse piece included",
      "• Available in 5 colour combinations",
    ].join("\n"),
    fabric: "Banarasi Warm Soft Silk",
    blouseIncluded: true,
    sellingPrice: 950,
    originalPrice: 950,
    tags: ["banarasi", "warm silk", "soft silk", "zari butti", "meenakari border", "contrast pallu", "trending"],
    isNewArrival: true,
    isFeatured: true,
    colours: [
      {
        name: "Royal Blue & Sky Blue",
        skuSuffix: "RBS",
        stock: 50,
        images: [
          { file: "01-royal-blue-sky-blue-drape.jpg", view: "draped" },
          { file: "02-royal-blue-sky-blue-border.jpg", view: "draped" },
        ],
      },
      {
        name: "Mustard Yellow & Red",
        skuSuffix: "MYR",
        stock: 50,
        images: [
          { file: "03-mustard-red-drape.jpg", view: "draped" },
          { file: "04-mustard-red-pallu.jpg", view: "draped" },
          { file: "05-mustard-red-border.jpg", view: "draped" },
        ],
      },
      {
        name: "Baby Pink & Bottle Green",
        skuSuffix: "PBG",
        stock: 50,
        images: [
          { file: "06-pink-green-drape.jpg", view: "draped" },
          { file: "07-pink-green-pallu.jpg", view: "draped" },
          { file: "08-pink-green-border.jpg", view: "draped" },
        ],
      },
      {
        name: "Turquoise & Purple",
        skuSuffix: "TQP",
        stock: 50,
        images: [
          { file: "09-turquoise-purple-drape.jpg", view: "draped" },
          { file: "10-turquoise-purple-pallu.jpg", view: "draped" },
          { file: "11-turquoise-purple-border.jpg", view: "draped" },
        ],
      },
      {
        name: "Mint Green & Wine",
        skuSuffix: "MGW",
        stock: 50,
        images: [
          { file: "12-mint-wine-drape.jpg", view: "draped" },
          { file: "13-mint-wine-border.jpg", view: "draped" },
        ],
      },
    ],
  },
];

async function upsertProduct(def: CatalogProduct) {
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: def.categorySlug } });
  const hasColourOptions = def.colours.length > 0;
  const totalStock = hasColourOptions ? def.colours.reduce((sum, c) => sum + c.stock, 0) : (def.stock ?? 0);

  const fields = {
    name: def.name,
    sku: def.sku,
    categoryId: category.id,
    shortDescription: def.shortDescription,
    description: def.description,
    fabric: def.fabric,
    color: hasColourOptions ? null : (def.colour ?? null),
    blouseIncluded: def.blouseIncluded,
    sellingPrice: def.sellingPrice,
    originalPrice: def.originalPrice,
    stock: totalStock,
    tags: def.tags,
    isNewArrival: def.isNewArrival,
    isFeatured: def.isFeatured,
    status: "PUBLISHED" as const,
  };

  const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
  const product = existing
    ? await prisma.product.update({ where: { id: existing.id }, data: fields })
    : await prisma.product.create({ data: { ...fields, slug: def.slug, publishedAt: new Date() } });

  // Variants are upserted by SKU so cart lines that reference them survive a re-run.
  const variantIds = new Map<string, string>();
  for (const colour of def.colours) {
    const sku = `${def.sku}-${colour.skuSuffix}`;
    const variant = await prisma.productVariant.upsert({
      where: { sku },
      create: {
        productId: product.id,
        sku,
        attributes: { color: colour.name },
        price: def.sellingPrice,
        stock: colour.stock,
      },
      update: { attributes: { color: colour.name }, price: def.sellingPrice, stock: colour.stock, isAvailable: true },
    });
    variantIds.set(colour.name, variant.id);
  }

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  const colourName = def.colour ?? "";
  const singleImages = (def.images ?? []).map((img) => ({
    url: `${def.imageFolder}/${img.file}`,
    altText: `${def.name}${colourName ? ` in ${colourName}` : ""}, ${img.view === "worn" ? "worn by a model" : "draped to show the border and pallu"}`,
    variantId: null as string | null,
  }));
  const images = hasColourOptions
    ? def.colours.flatMap((colour) =>
        colour.images.map((img) => ({
          url: `${def.imageFolder}/${img.file}`,
          altText: `${def.name} in ${colour.name}, ${img.view === "worn" ? "worn by a model" : "draped to show the border and pallu"}`,
          variantId: variantIds.get(colour.name)! as string | null,
        })),
      )
    : singleImages;
  await prisma.productImage.createMany({
    data: images.map((img, index) => ({ ...img, productId: product.id, displayOrder: index, isPrimary: index === 0 })),
  });

  console.log(
    `${existing ? "Updated" : "Created"} ${def.name}: ${hasColourOptions ? `${def.colours.length} colours` : `colour ${def.colour ?? "—"}`}, ${images.length} images, stock ${totalStock}`,
  );
}

async function main() {
  for (const def of PRODUCTS) await upsertProduct(def);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
