import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Força rebuild completo - invalida cache
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },
  // Desabilita otimizações que causam cache
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
