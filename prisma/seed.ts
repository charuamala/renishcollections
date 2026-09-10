/**
 * Development/demo seed data for Renish Collections.
 *
 * Everything here — products, reviews, the admin account — is clearly
 * synthetic sample content for local development and demos. It is not meant
 * to be run against a production database. Change SEED_ADMIN_EMAIL /
 * SEED_ADMIN_PASSWORD in .env before ever seeding a real environment, and
 * do not seed the demo reviews/customer there.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function placeholderImage(seed: string, width = 900, height = 1200) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function main() {
  console.log("Seeding categories...");

  const sarees = await prisma.category.upsert({
    where: { slug: "sarees" },
    update: {},
    create: {
      name: "Sarees",
      slug: "sarees",
      description: "Silk, cotton, designer and wedding sarees curated for the modern Indian woman.",
      imageUrl: placeholderImage("category-sarees", 400, 400),
      displayOrder: 1,
      isPublished: true,
      seoTitle: "Buy Sarees Online — Silk, Cotton & Designer Sarees",
      seoDescription: "Shop the latest saree collection online at Renish Collections.",
    },
  });

  const subcategoryDefs = [
    { name: "Silk Sarees", slug: "silk-sarees" },
    { name: "Cotton Sarees", slug: "cotton-sarees" },
    { name: "Designer Sarees", slug: "designer-sarees" },
    { name: "Wedding Sarees", slug: "wedding-sarees" },
    { name: "Printed Sarees", slug: "printed-sarees" },
    { name: "Party Wear Sarees", slug: "party-wear-sarees" },
    { name: "Traditional Sarees", slug: "traditional-sarees" },
  ];

  const subcategories: Record<string, Awaited<ReturnType<typeof prisma.category.upsert>>> = {};
  for (const [index, def] of subcategoryDefs.entries()) {
    subcategories[def.slug] = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        parentId: sarees.id,
        imageUrl: placeholderImage(`category-${def.slug}`, 400, 400),
        displayOrder: index,
        isPublished: true,
      },
    });
  }

  // Future verticals — present in the schema, unpublished until the business
  // is ready to launch them. Demonstrates the category system needs no code
  // changes to grow beyond sarees.
  for (const [index, def] of [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Kids", slug: "kids" },
    { name: "Jewellery", slug: "jewellery" },
    { name: "Accessories", slug: "accessories" },
  ].entries()) {
    await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: { name: def.name, slug: def.slug, displayOrder: 10 + index, isPublished: false },
    });
  }

  console.log("Seeding products...");

  const productDefs = [
    {
      slug: "kanchipuram-silk-saree-maroon",
      name: "Kanchipuram Silk Saree — Maroon with Gold Zari Border",
      sku: "RC-SLK-001",
      category: "silk-sarees",
      sellingPrice: 6499,
      originalPrice: 8999,
      wholesalePrice: 4200,
      fabric: "Pure Silk",
      color: "Maroon",
      sareeLength: "6.3 meters",
      blouseIncluded: true,
      tags: ["silk", "kanchipuram", "wedding", "maroon"],
      isFeatured: true,
      isBestSeller: true,
      stock: 12,
    },
    {
      slug: "banarasi-silk-saree-royal-blue",
      name: "Banarasi Silk Saree — Royal Blue with Silver Zari",
      sku: "RC-SLK-002",
      category: "silk-sarees",
      sellingPrice: 7299,
      originalPrice: 9499,
      wholesalePrice: 4800,
      fabric: "Banarasi Silk",
      color: "Royal Blue",
      sareeLength: "6.3 meters",
      blouseIncluded: true,
      tags: ["silk", "banarasi", "wedding", "blue"],
      isNewArrival: true,
      stock: 8,
    },
    {
      slug: "handloom-cotton-saree-mustard",
      name: "Handloom Cotton Saree — Mustard Yellow",
      sku: "RC-CTN-001",
      category: "cotton-sarees",
      sellingPrice: 1499,
      originalPrice: 1999,
      wholesalePrice: 900,
      fabric: "Handloom Cotton",
      color: "Mustard",
      sareeLength: "5.8 meters",
      blouseIncluded: false,
      tags: ["cotton", "handloom", "daily-wear", "yellow"],
      isNewArrival: true,
      stock: 20,
    },
    {
      slug: "cotton-saree-white-blue-checks",
      name: "Cotton Saree — White with Blue Checks",
      sku: "RC-CTN-002",
      category: "cotton-sarees",
      sellingPrice: 1299,
      originalPrice: 1699,
      wholesalePrice: 780,
      fabric: "Cotton",
      color: "White",
      sareeLength: "5.8 meters",
      blouseIncluded: false,
      tags: ["cotton", "casual", "checks"],
      stock: 25,
    },
    {
      slug: "designer-georgette-saree-emerald",
      name: "Designer Georgette Saree — Emerald Green with Sequin Work",
      sku: "RC-DSG-001",
      category: "designer-sarees",
      sellingPrice: 3999,
      originalPrice: 5499,
      wholesalePrice: 2400,
      fabric: "Georgette",
      color: "Emerald Green",
      sareeLength: "6.0 meters",
      blouseIncluded: true,
      tags: ["designer", "party-wear", "sequin", "green"],
      isFeatured: true,
      stock: 10,
    },
    {
      slug: "designer-net-saree-blush-pink",
      name: "Designer Net Saree — Blush Pink with Embroidery",
      sku: "RC-DSG-002",
      category: "designer-sarees",
      sellingPrice: 4599,
      originalPrice: 6299,
      wholesalePrice: 2900,
      fabric: "Net",
      color: "Blush Pink",
      sareeLength: "6.0 meters",
      blouseIncluded: true,
      tags: ["designer", "embroidery", "pink"],
      isFeatured: true,
      isBestSeller: true,
      stock: 6,
    },
    {
      slug: "bridal-silk-saree-red-gold",
      name: "Bridal Silk Saree — Red with Heavy Gold Zari Work",
      sku: "RC-WED-001",
      category: "wedding-sarees",
      sellingPrice: 12999,
      originalPrice: 16999,
      wholesalePrice: 8500,
      fabric: "Pure Silk",
      color: "Red",
      sareeLength: "6.3 meters",
      blouseIncluded: true,
      tags: ["wedding", "bridal", "red", "zari"],
      isBestSeller: true,
      stock: 5,
    },
    {
      slug: "printed-crepe-saree-floral",
      name: "Printed Crepe Saree — Floral Multicolor",
      sku: "RC-PRT-001",
      category: "printed-sarees",
      sellingPrice: 1899,
      originalPrice: 2499,
      wholesalePrice: 1100,
      fabric: "Crepe",
      color: "Multicolor",
      sareeLength: "5.8 meters",
      blouseIncluded: false,
      tags: ["printed", "floral", "casual"],
      isNewArrival: true,
      stock: 18,
    },
    {
      slug: "party-wear-shimmer-saree-black",
      name: "Party Wear Shimmer Saree — Black with Stone Work",
      sku: "RC-PTY-001",
      category: "party-wear-sarees",
      sellingPrice: 3299,
      originalPrice: 4499,
      wholesalePrice: 1950,
      fabric: "Shimmer Georgette",
      color: "Black",
      sareeLength: "6.0 meters",
      blouseIncluded: true,
      tags: ["party-wear", "shimmer", "black"],
      stock: 9,
    },
    {
      slug: "traditional-ilkal-saree-orange",
      name: "Traditional Ilkal Saree — Orange with Temple Border",
      sku: "RC-TRD-001",
      category: "traditional-sarees",
      sellingPrice: 2199,
      originalPrice: 2899,
      wholesalePrice: 1300,
      fabric: "Cotton Silk Blend",
      color: "Orange",
      sareeLength: "6.0 meters",
      blouseIncluded: true,
      tags: ["traditional", "ilkal", "temple-border"],
      stock: 11,
    },
  ];

  for (const def of productDefs) {
    const category = subcategories[def.category];
    const product = await prisma.product.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name,
        slug: def.slug,
        sku: def.sku,
        categoryId: category.id,
        shortDescription: `${def.fabric} saree in ${def.color.toLowerCase()}, handpicked for everyday elegance and special occasions.`,
        description: `This ${def.fabric.toLowerCase()} saree in ${def.color.toLowerCase()} is crafted for comfort and style. Pair it with statement jewellery for festive occasions or keep it minimal for everyday elegance.`,
        sellingPrice: def.sellingPrice,
        originalPrice: def.originalPrice,
        wholesalePrice: def.wholesalePrice,
        stock: def.stock,
        fabric: def.fabric,
        color: def.color,
        sareeLength: def.sareeLength,
        blouseIncluded: def.blouseIncluded,
        careInstructions: "Dry clean recommended. Store in a muslin cloth away from direct sunlight.",
        tags: def.tags,
        status: "PUBLISHED",
        isFeatured: def.isFeatured ?? false,
        isNewArrival: def.isNewArrival ?? false,
        isBestSeller: def.isBestSeller ?? false,
        publishedAt: new Date(),
        seoTitle: def.name,
        seoDescription: `Buy ${def.name} online at Renish Collections. ${def.fabric} saree, ${def.sareeLength}, in ${def.color.toLowerCase()}.`,
      },
    });

    // Two images per product for a working gallery.
    for (let i = 0; i < 2; i++) {
      await prisma.productImage.upsert({
        where: { id: `${product.id}-seed-img-${i}` },
        update: {},
        create: {
          id: `${product.id}-seed-img-${i}`,
          productId: product.id,
          url: placeholderImage(`${def.slug}-${i}`),
          altText: `${def.name} — view ${i + 1}`,
          displayOrder: i,
          isPrimary: i === 0,
        },
      });
    }
  }

  console.log("Seeding admin & demo customer...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@renishcollections.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Renish Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
    },
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: "demo.customer@renishcollections.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo.customer@renishcollections.com",
      passwordHash: await bcrypt.hash("Demo1234!", 12),
      role: "CUSTOMER",
    },
  });

  console.log("Seeding demo reviews (clearly marked sample content)...");
  const reviewTargets = await prisma.product.findMany({ take: 3 });
  for (const [i, product] of reviewTargets.entries()) {
    await prisma.review.upsert({
      where: { id: `seed-review-${product.id}` },
      update: {},
      create: {
        id: `seed-review-${product.id}`,
        productId: product.id,
        userId: demoCustomer.id,
        rating: 5 - (i % 2),
        title: "Beautiful quality",
        body: "Sample demo review seeded for local development — replace with real customer feedback once orders start coming in.",
        isVerifiedPurchase: false,
        isApproved: true,
        isFeatured: true,
      },
    });
  }

  console.log("Seeding coupons...");
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off on your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 999,
      maxDiscountAmount: 1000,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });

  console.log("Seeding homepage banner...");
  const bannerId = "seed-home-hero-banner";
  await prisma.banner.upsert({
    where: { id: bannerId },
    update: {},
    create: {
      id: bannerId,
      title: "Festive Saree Collection — Up to 30% Off",
      imageUrl: placeholderImage("home-hero-banner", 1600, 900),
      linkUrl: "/sarees",
      placement: "HOME_HERO",
      displayOrder: 0,
      isActive: true,
    },
  });

  console.log("Seeding site settings...");
  const siteSettingsData = {
    storeName: "Renish Collections",
    contactEmail: "hello@renishcollections.com",
    whatsappNumber: "+910000000000",
    instagramUrl: "https://instagram.com/renishcollections",
    freeShippingThreshold: 1999,
    taxPercentage: 5,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: siteSettingsData,
    create: { id: "singleton", ...siteSettingsData },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
