import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * POST /api/webhooks/retell
 * Ingest Retell call_ended (and related) webhooks. Validate secret, then store calls + call_artifacts + events.
 * Body should include organization_id (UUID) for RLS/tenant isolation.
 */
export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-retell-secret") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const expected = process.env.RETELL_WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const organization_id = body.organization_id as string | undefined;
    if (!organization_id || !/^[0-9a-f-]{36}$/i.test(organization_id)) {
      return NextResponse.json(
        { error: "Missing or invalid organization_id" },
        { status: 400 }
      );
    }

    const call_id = body.call_id ?? body.id;
    const call_type = body.call_type ?? "retell";
    const started_at = body.start_timestamp ?? body.started_at ?? body.start_time ?? new Date().toISOString();
    const ended_at = body.end_timestamp ?? body.ended_at ?? body.end_time ?? new Date().toISOString();
    const transcript = body.transcript ?? body.call_analysis?.transcript ?? null;
    const summary = body.call_analysis?.summary ?? body.summary ?? null;
    const recording_url = body.recording_url ?? body.recording ?? null;

    const supabase = createServiceRoleClient();

    const { data: callRow, error: callError } = await supabase
      .from("calls")
      .insert({
        organization_id,
        external_id: call_id ?? null,
        started_at: started_at ? new Date(started_at).toISOString() : null,
        ended_at: ended_at ? new Date(ended_at).toISOString() : null,
        raw_payload: body,
      })
      .select("id")
      .single();

    if (callError) {
      return NextResponse.json({ error: callError.message }, { status: 500 });
    }
    const id = (callRow as { id: string }).id;
    if (transcript || summary || recording_url) {
      await supabase.from("call_artifacts").insert({
        call_id: id,
        kind: "summary",
        content: [transcript, summary].filter(Boolean).join("\n\n") || null,
        recording_url: recording_url ?? null,
      });
    }
    await supabase.from("events").insert({
      client_id: organization_id,
      type: "call_ended",
      source: call_type,
      occurred_at: ended_at ?? new Date().toISOString(),
      payload: body,
    });
    return NextResponse.json({ success: true, call_id: id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
