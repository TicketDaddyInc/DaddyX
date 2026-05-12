import type { NextConfig } from "next";
import path from "path";

// Workspace root (monorepo root) — fixes Next.js lockfile detection warning
const workspaceRoot = path.resolve(__dirname, "../..");

const nextConfig: NextConfig = {
  // Emit a self-contained Node.js server for Docker / Dokploy deployments
  output: "standalone",

  // Point Next.js to the actual monorepo root to fix workspace root detection
  outputFileTracingRoot: workspaceRoot,

  // Allow importing from workspace packages
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/db",
  ],

  // Resolve the "@" path alias inside Next.js (mirrors tsconfig paths)
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Polyfills required by @solana/web3.js and @coral-xyz/anchor in browser
    // Only apply to client bundles — server already has Node.js built-ins
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        zlib: false,
        http: false,
        https: false,
      };

      // Provide Buffer + process globally (Solana wallet adapters need these)
      // IMPORTANT: Only do this for client bundles so server-side process.env is not overwritten
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
