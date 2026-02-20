import { NextResponse } from "next/server";

/**
 * For admins: sets a cookie so they can view the client portal, then redirects to /dashboard.
 * Link to this from the admin dashboard "Client portal" button.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(`${url.origin}/dashboard`);
  res.cookies.set("view_as_client", "1", { path: "/", maxAge: 60 * 60 }); // 1 hour
  return res;
}
