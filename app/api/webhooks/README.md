# Webhooks (Retell, Twilio)

Events from these webhooks feed the **client dashboard** (KPIs and Recent Activity). Use the same UUID as the client in your app.

## Client / organization ID

- The dashboard shows data for a **client** (URL: `/dashboard/<clientId>`).
- In Supabase, that client has an id in the `clients` table.
- **Use that client UUID** as `organization_id` when configuring Retell and Twilio so events show up for the right client.

(If you use the MVP schema, `organizations` was backfilled from `clients`, so organization id and client id are the same.)

---

## Retell (calls)

**Endpoint:** `POST https://<your-app>/api/webhooks/retell`

**Headers:**  
`x-retell-secret` or `Authorization: Bearer <secret>` — set `RETELL_WEBHOOK_SECRET` in Vercel.

**Body (JSON):**  
- `organization_id` (required) — client UUID (from `clients.id`).
- Plus whatever Retell sends: `call_id`, `start_timestamp`, `end_timestamp`, `transcript`, `call_analysis.summary`, `recording_url`, etc.

**Dashboard:**  
Each event is stored as `call_ended` and drives:
- **Answered Calls** KPI (this month)
- **Recent Activity** (with “Call completed” or payload summary)

Configure your Retell webhook to POST to this URL and include `organization_id` (e.g. from your CRM or a static value per client).

---

## Twilio (SMS)

**Endpoint:** `POST https://<your-app>/api/webhooks/twilio`

**Headers:**  
`x-twilio-webhook-secret` or `x-webhook-secret` — set `TWILIO_WEBHOOK_SECRET` in Vercel.

**Body:**  
Form-encoded or JSON. Must include:
- `organization_id` (or `OrgId`) — client UUID.
- Twilio fields: `From`, `To`, `Body`, `Direction` (or `SmsStatus` for inbound).

**Dashboard:**  
- **Inbound** SMS → event type `sms_reply` → **SMS Follow-ups** KPI + Recent Activity.  
- **Outbound** SMS → event type `sms_sent` → Recent Activity only (not counted in the reply KPI).

Add `organization_id` to the webhook URL as a query parameter, or send it in the request body (e.g. via Twilio’s custom params if your app adds them).

---

## Env vars (Vercel)

- `RETELL_WEBHOOK_SECRET` — required if you want to verify Retell requests.
- `TWILIO_WEBHOOK_SECRET` — required if you want to verify Twilio requests.

Without these, the webhooks return 401 when the secret is checked.
