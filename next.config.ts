import type { NextConfig } from "next";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const nextConfig: NextConfig = {
  ...(isDemo && {
    output: "export",
    basePath: "/Kurban_Hisse_Takip",
    trailingSlash: true,
  }),
  images: {
    unoptimized: isDemo,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
