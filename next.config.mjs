/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => {
    return [
      {
        source: '/',
        destination: '/landing/index.html',
      },
    ]
  },
  // experimental: {
  // optimizeServerReact: true,
  // optimizePackageImports: ['zod', '@workos-inc/authkit-nextjs', 'clsx', 'react-hook-form', 'tailwind-merge', 'tailwindcss-animate']
  // }
};

export default nextConfig;
