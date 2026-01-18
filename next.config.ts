import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '45.67.203.108',
        port: '8080',
        pathname: '/uploads/**',
      },
      // YENİ: avtomir.az domeni üçün icazə (şəkillər buradan gələndə xəta verməsin)
      {
        protocol: 'https',
        hostname: 'avtomir.az',
        pathname: '/uploads/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://45.67.203.108:8080/api/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);