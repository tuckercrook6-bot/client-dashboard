import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * POST /api/webhooks/zapier
 *
 * Zapier (or any sender) can POST events to drive the client dashboard.
 *
 * Headers:
 *   x-webhook-secret: must match ZAPIER_WEBHOOK_SECRET
 *
 * Body (JSON):
 *   client_id (required) – UUID of the client in Supabase `clients` table
 *   type (required)      – Event type (see below)
 *   source (required)    – e.g. "zapier", "calendly", "typeform"
 *   occurred_at (optional) – ISO timestamp; defaults to now
 *   payload (optional)   – arbitrary JSON; shown in Recent Activity (description from payload.description or payload.summary)
 *
 * Event types that drive the client dashboard:
 *   lead_created, form_submit → New Leads KPI + Recent Activity
 *   call_ended               → Answered Calls KPI + Recent Activity
 *   sms_reply                 → SMS Follow-ups KPI + Recent Activity
 *   appointment_booked        → Appointments KPI + Recent Activity
 */
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
