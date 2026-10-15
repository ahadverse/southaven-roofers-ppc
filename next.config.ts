import type { NextConfig } from "next";

// The tracking number is required: every call button on the site uses it.
// Fail the build early instead of shipping a site with a broken phone link.
const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER;
if (!phone || !/^\+1\d{10}$/.test(phone)) {
  throw new Error(
    "NEXT_PUBLIC_PHONE_NUMBER is missing or invalid. Set it to your tracking number in E.164 format, for example +16625550100 (see .env.example)."
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
