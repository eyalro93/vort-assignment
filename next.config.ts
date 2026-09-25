import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb", // matches Vercel's hard request-body cap
    },
  },
  // Lets phones on the same WiFi load the dev server via LAN IP for
  // real-device testing. Dev-only; irrelevant once actually deployed.
  allowedDevOrigins: [
    "172.18.114.64",
    "192.168.*.*",
    "172.*.*.*",
    "10.*.*.*",
    "*.loca.lt", // localtunnel, for testing on a real phone over the public internet
  ],
};

export default nextConfig;
