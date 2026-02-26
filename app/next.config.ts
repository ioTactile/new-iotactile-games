import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
  },
};

export default nextConfig;
