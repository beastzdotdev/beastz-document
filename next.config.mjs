/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
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
