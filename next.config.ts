import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type checking and linting run locally and in CI — skip during production build
  // to avoid OOM on low-memory servers (t3.micro has 1 GB RAM).
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
