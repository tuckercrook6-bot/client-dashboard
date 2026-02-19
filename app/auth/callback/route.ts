import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
        // Always land on login page after auth; user chooses Admin or Dashboard from there.
        const to = nextParam ? `${base}${nextParam}` : `${base}/login`;
        return NextResponse.redirect(to);
      }
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_error`);
}
