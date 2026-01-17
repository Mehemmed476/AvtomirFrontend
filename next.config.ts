import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '45.67.203.108',
        port: '',
        pathname: '/uploads_data/**', 
      },
    ],
  },
};
 
export default withNextIntl(nextConfig);