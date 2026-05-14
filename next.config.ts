import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Esto le dice a Vercel que ignore los errores de TypeScript al construir
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto le dice a Vercel que ignore los advertencias de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
