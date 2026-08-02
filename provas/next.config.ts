import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed behind the F3Exatas hub's rewrite at f3-exatas.vercel.app/provas,
  // so the app itself needs to know it lives under this sub-path.
  // Must match src/lib/base-path.ts. Changing this requires a rebuild.
  basePath: "/provas",
};

export default nextConfig;
