/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Rewrites to backend - only enable when backend is running
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : 'http://localhost:8080/api/:path*',
  //     },
  //     {
  //       source: '/ws/:path*',
  //       destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/ws/:path*` : 'http://localhost:8080/ws/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
