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
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
  async redirects() {
    return [
      {
        source: "/:path*", // Match all paths
        has: [
          {
            type: "host",
            value: "goschool.uk", // Redirect only if the host is goschool.uk
          },
        ],
        destination: "https://www.goschool.uk/:path*", // Redirect to www.goschool.uk
        permanent: true, // 301 redirect
      },
    ];
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