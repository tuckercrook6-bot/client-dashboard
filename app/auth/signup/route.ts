import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password required (min 6 characters)" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: new URL(request.url).origin + "/auth/callback?next=/admin" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (data.session) {
    return NextResponse.json({ redirect: "/admin" });
  }
  return NextResponse.json({
    message: "Check your email to confirm your account.",
  });
}
