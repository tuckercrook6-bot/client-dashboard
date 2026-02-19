import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * POST /api/webhooks/twilio
 * Inbound/outbound SMS webhook. Validate secret, then store sms_messages + events.
 * Body (form or JSON) must include organization_id for tenant isolation (e.g. custom Twilio parameter).
 */
export async function POST(req: Request) {
  try {
    const secret =
      req.headers.get("x-twilio-webhook-secret") ??
      req.headers.get("x-webhook-secret") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const expected = process.env.TWILIO_WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, string>;
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, string>;
    } else {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text)) as Record<string, string>;
    }

    const organization_id = body.organization_id ?? body.OrgId;
    if (!organization_id || !/^[0-9a-f-]{36}$/i.test(organization_id)) {
      return NextResponse.json(
        { error: "Missing or invalid organization_id (or OrgId)" },
        { status: 400 }
      );
    }

    const from_phone = body.From ?? body.from ?? "";
    const to_phone = body.To ?? body.to ?? "";
    const sms_body = body.Body ?? body.body ?? "";
    const direction = body.SmsStatus === "received" || body.Direction === "inbound" ? "inbound" : "outbound";
    const external_id = body.MessageSid ?? body.SmsSid ?? null;

    const supabase = createServiceRoleClient();

    const { data: smsRow, error: smsError } = await supabase
      .from("sms_messages")
      .insert({
        organization_id,
        direction,
        from_phone,
        to_phone,
        body: sms_body,
        external_id,
        raw_payload: body,
      })
      .select("id")
      .single();

    if (smsError) {
      return NextResponse.json({ error: smsError.message }, { status: 500 });
    }

    await supabase.from("events").insert({
      client_id: organization_id,
      type: "sms_reply",
      source: "twilio",
      occurred_at: new Date().toISOString(),
      payload: body,
    });

    return NextResponse.json({ success: true, id: (smsRow as { id: string }).id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
