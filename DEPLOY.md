# Vercel deploy checklist

## 1. Connect Vercel MCP in Cursor (so the AI can deploy for you)

- **Settings → Cursor Settings → Tools & MCP** → add server: **URL** `https://mcp.vercel.com`, **Name** `vercel`
- When prompted, click **Needs login** and complete Vercel OAuth
- After it shows connected, tell the AI: "Vercel is connected" and it can deploy and set the domain

## 2. Deploy from this folder

- **Root directory**: Use `client-dashboard-main` (this folder) as the Vercel project root, or deploy from repo and set **Root Directory** to `client-dashboard-main` in Project Settings.
- **Build command**: `npm run build` (default)
- **Output**: Next.js (auto-detected)

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

Add for **Production**, **Preview**, and **Development**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) For seed script / admin APIs |

## 4. Custom domain (app.lowcoresystems.com)

- Vercel → Project → **Settings → Domains** → Add `app.lowcoresystems.com`
- In your DNS (where lowcoresystems.com is hosted), add:
  - **CNAME** `app` → `cname.vercel-dns.com`  
  or use the exact target Vercel shows (e.g. `your-project.vercel.app`)
