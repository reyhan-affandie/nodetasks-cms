// Fixed version with safe URL parsing and environment fallback

import { API_URL, NODE_ENV, PORT } from "@/constants/env";
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

let parsedUrl: URL;
let protocol: "http" | "https" = "https";
let hostname = "localhost";

try {
  parsedUrl = new URL(API_URL);
  protocol = parsedUrl.protocol.replace(":", "") as "http" | "https";
  hostname = parsedUrl.hostname;
} catch (error) {
  console.warn(`Invalid API_URL fallback to localhost:${PORT}`, API_URL, error);
  protocol = "https";
  hostname = API_URL.replace("https://", "");
}

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig) => {
    if (NODE_ENV === "development" || hostname === "localhost") {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["node_modules", ".next/**/*"],
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol,
        hostname,
        pathname: "/public/**",
      },
      {
        protocol: "http",
        hostname: "host.docker.internal",
        pathname: "/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
