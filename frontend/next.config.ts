import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: undefined,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
