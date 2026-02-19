# Security Audit

## Current Stage: Milestone 2 implemented (auth + protected dashboard)

### Milestone Status

- **Milestone 1 (Env + Supabase stable):** ✓ Done
- **Milestone 2 (Auth + tenant isolation):** ✓ Done (auth + middleware; run RLS migration in Supabase)
- **Milestone 3–5:** Not started

---

## Must-Do Before Production

1. **Run RLS migration**  
   Execute `supabase/migrations/00001_rls_recommended.sql` in the Supabase SQL Editor. Until then, anon key can read all rows; after RLS + `user_clients`, only assigned clients are visible.

2. **Populate `user_clients`**  
   After RLS is enabled, insert rows mapping `auth.users.id` to `clients.id` for each user’s allowed clients.

---

## Should-Fix Soon

1. **Webhook client_id validation**  
   Zapier webhook accepts `client_id` from the body. Consider validating it exists in `clients`.  
   - Secret verification is in place ✓

---

## Later

- Billing + roles + audit logs (Milestone 5)

---

## Verification Checklist

- [ ] Run RLS migration in Supabase
- [ ] Populate `user_clients` for each user
- [x] Supabase Auth (login + magic link + password)
- [x] Middleware for session refresh
- [x] Protect `/dashboard` routes (redirect to `/login`)
- [x] Server client uses cookies; RLS applies when migration is run
- [x] Never use service role in client bundle
- [x] Webhook verifies secret
