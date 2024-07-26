/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  reactStrictMode: false,
  rewrites: () => {
    return [
      {
        source: '/',
        destination: '/landing/index.html',
      },
    ]
  },
};

export default nextConfig;
