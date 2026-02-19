import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRoleForUserId, getDefaultRedirectForRole } from "@/lib/auth-role";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, magicLink, next: nextParam } = body as {
    email?: string;
    password?: string;
    magicLink?: boolean;
    next?: string;
  };
  const defaultNext = nextParam ?? null;

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  if (magicLink) {
    const origin = new URL(request.url).origin;
    const next = defaultNext ?? "/dashboard";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({
      message: "Check your email for the sign-in link.",
    });
  }

  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  const redirect =
    defaultNext ??
    (data.session?.user?.id
      ? getDefaultRedirectForRole(await getRoleForUserId(data.session.user.id, data.session.user.email))
      : "/dashboard");
  return NextResponse.json({ redirect });
}
