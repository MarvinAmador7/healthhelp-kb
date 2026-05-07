import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
    formats: ["image/webp"],
  },
  // No PHI in logs
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
