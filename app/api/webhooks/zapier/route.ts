import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-webhook-secret");

    if (!secret || secret !== process.env.ZAPIER_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { client_id, type, source, occurred_at, payload } = body;

    if (!client_id || !type || !source) {
      return NextResponse.json(
        { error: "Missing client_id/type/source" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("events").insert({
      client_id,
      type,
      source,
      occurred_at: occurred_at ?? new Date().toISOString(),
      payload: payload ?? body,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
