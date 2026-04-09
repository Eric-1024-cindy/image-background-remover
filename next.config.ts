import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '985f86243dcef4a9-129-226-219-198.serveousercontent.com',
    'serveousercontent.com',
  ],
};

export default nextConfig;
