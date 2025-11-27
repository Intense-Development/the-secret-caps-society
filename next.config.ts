import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  transpilePackages: ["next-intl"],
  serverExternalPackages: ["@supabase/supabase-js"],
};

// Apply the plugin
const config = withNextIntl(nextConfig);

export default config;
