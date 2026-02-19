import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-role";

const MICHAEL_EMAIL = "michael@lowcoresystems.com";

export async function POST(request: Request) {
  const secret = request.headers.get("x-setup-secret");
  const expected = process.env.ADMIN_SETUP_SECRET;
  const allowedBySecret = !!expected && secret === expected;

  if (!allowedBySecret) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email && isAdminEmail(data.session.user.email)) {
        // allow
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { password?: string } = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const providedPassword = typeof body.password === "string" && body.password.length >= 6 ? body.password : null;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const randomPassword = () => Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const password = providedPassword ?? randomPassword();

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: MICHAEL_EMAIL,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes("already been registered") || error.message?.includes("already exists")) {
      return NextResponse.json({ ok: true, message: "User already exists; no change." });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "No user returned" }, { status: 500 });
  }

  const res: { ok: true; message: string; temporaryPassword?: string } = {
    ok: true,
    message: "Created michael@lowcoresystems.com. He can sign in at /login.",
  };
  if (!providedPassword) res.temporaryPassword = password;
  return NextResponse.json(res);
}
