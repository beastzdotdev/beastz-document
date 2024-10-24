/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: '4000',
        pathname: '/**'
      },
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
