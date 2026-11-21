/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || "http://localhost:5002";
const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
// env-файлы проекта исторически используют префикс VITE_*, а Next.js
// подставляет в клиентский бандл только NEXT_PUBLIC_*. Прокидываем оба варианта.
const archimedApiUrl =
  process.env.NEXT_PUBLIC_ARCHIMED_API_URL ||
  process.env.VITE_ARCHIMED_API_URL ||
  "/api/archimed";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_ARCHIMED_API_URL: archimedApiUrl,
  },
  // Позволяет собрать проект в временный каталог (обход прав на .next)
  distDir: process.env.NEXT_BUILD_DIST_DIR || ".next",

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
