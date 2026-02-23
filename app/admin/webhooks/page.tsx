import { getUserClients } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyClientIds } from "@/components/admin/copy-client-ids";

const BASE = "https://app.lowcoresystems.com";

export default async function AdminWebhooksPage() {
  const clients = await getUserClients();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Webhook setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use these URLs in Retell and Twilio. Send the client UUID as <code className="rounded bg-muted px-1 py-0.5 text-xs">organization_id</code> so events show on the right dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Retell (calls)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Webhook URL</p>
            <code className="block break-all rounded bg-muted px-2 py-1.5 text-xs text-foreground">
              {BASE}/api/webhooks/retell
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Body: include <code className="rounded bg-muted px-1">organization_id</code> = client UUID below.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Twilio (SMS)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">Webhook URL</p>
            <code className="block break-all rounded bg-muted px-2 py-1.5 text-xs text-foreground">
              {BASE}/api/webhooks/twilio
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Body or query: include <code className="rounded bg-muted px-1">organization_id</code> or <code className="rounded bg-muted px-1">OrgId</code> = client UUID below.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Client IDs (use as organization_id)</CardTitle>
          <p className="text-xs text-muted-foreground">Copy the UUID for the client you’re configuring in Retell or Twilio.</p>
        </CardHeader>
        <CardContent>
          <CopyClientIds clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
