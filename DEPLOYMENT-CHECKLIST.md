# Why updates might not be live – checklist

Vercel is set to build from this folder (`client-dashboard-main` = Root Directory).

**For your changes to go live:**

1. **This folder must be in Git and pushed**
   - The repo connected to Vercel must contain this folder (e.g. `client-dashboard-main/app/`, `client-dashboard-main/package.json`, etc.).
   - If your repo root is the **parent** of this folder, commit and push from the parent so this folder is included.

2. **Push to the branch Vercel deploys**
   - In Vercel → Project → Settings → Git, check which branch is used for Production (often `main`).
   - Push your commits to that branch.

3. **Trigger a new deploy**
   - After pushing: Vercel usually deploys automatically.
   - Or in Vercel → Deployments → click the three dots on the latest → "Redeploy".

4. **Wait for the build**
   - Deployments → open the latest → wait until "Ready". Then open your domain.

**Quick test:** Change this file (e.g. add a space), commit, push, and redeploy. If the new deployment is "Ready" but the site looks the same, the branch or repo connected to Vercel may be wrong.
