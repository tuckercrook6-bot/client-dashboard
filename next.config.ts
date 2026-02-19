import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const noStore = [
      { key: "Cache-Control", value: "no-store, must-revalidate" },
    ];
    return [
      { source: "/", headers: noStore },
      { source: "/login", headers: noStore },
      { source: "/signup", headers: noStore },
      { source: "/admin", headers: noStore },
      { source: "/admin/:path*", headers: noStore },
      { source: "/dashboard", headers: noStore },
      { source: "/dashboard/:path*", headers: noStore },
    ];
  },
};

export default nextConfig;
