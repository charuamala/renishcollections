import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Used only by prisma/seed.ts demo data — safe to remove once real
      // Cloudinary product images replace the seeded placeholders.
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    qualities: [50, 75, 90, 100],
  },
};

export default nextConfig;
