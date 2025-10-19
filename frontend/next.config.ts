import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: undefined,
  },
  productionBrowserSourceMaps: false,
  // Output standalone for Docker deployments
  output: 'standalone',
  // Optimize images
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
