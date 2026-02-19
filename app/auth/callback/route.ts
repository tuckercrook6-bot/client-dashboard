import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRoleForUserId, getDefaultRedirectForRole } from "@/lib/auth-role";

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
        const next =
          nextParam ?? getDefaultRedirectForRole(await getRoleForUserId(data.session.user.id, data.session.user.email));
        return NextResponse.redirect(`${base}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_error`);
}
