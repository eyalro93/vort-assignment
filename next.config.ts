import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb", // CVs (PDF/Word) can run a few MB
    },
  },
  // Lets phones on the same WiFi load the dev server via LAN IP for
  // real-device testing. Dev-only; irrelevant once actually deployed.
  allowedDevOrigins: ["172.18.114.64", "192.168.*.*", "172.*.*.*", "10.*.*.*"],
};

export default nextConfig;
