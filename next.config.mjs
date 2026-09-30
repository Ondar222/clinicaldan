/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || "http://localhost:5002";
const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Прокси на существующий Express-бэкенд (в этот проект пока не переносился).
  // Фронтенд обращается к относительным путям /api/*, как и раньше в Vite.
  async rewrites() {
    return [
      {
        source: "/api/directus/:path*",
        destination: `${directusUrl}/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
