import pkg from 'next';
const { NextConfig } = pkg;

const baseConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Exclude 'child_process' from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
      };
    }
    return config;
  },
};

export default baseConfig;