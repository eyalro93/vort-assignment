import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb", // CVs (PDF/Word) can run a few MB
    },
  },
};

export default nextConfig;
