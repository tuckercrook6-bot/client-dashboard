import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail, getRoleForUserId, getDefaultRedirectForRole } from "@/lib/auth-role";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const base = url.origin;

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session?.user?.id) {
        const user = data.session.user;
        const admin = isAdminEmail(user.email);
        if (admin) {
          return NextResponse.redirect(`${base}/admin`);
        }
        const to = nextParam ? `${base}${nextParam}` : `${base}${getDefaultRedirectForRole(await getRoleForUserId(user.id, user.email))}`;
        return NextResponse.redirect(to);
      }
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_error`);
}
