import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These ship as barrel files; without this every icon and every motion export
  // is pulled into the graph because one of them was imported.
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "@tanstack/react-virtual"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
    // Sprites are square and rendered at a handful of fixed sizes.
    imageSizes: [64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
