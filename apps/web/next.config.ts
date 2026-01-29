import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@noqa/api", "@noqa/db", "@noqa/shared"],
};

export default nextConfig;
