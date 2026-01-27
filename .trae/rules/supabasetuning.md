# Context: fh5mobiletune
Stack: Next.js 14+ (App Router), TS, Supabase, Tailwind (Mobile-first).

# DB Schema (Immutable)
Table: `public.tunes`
 `id` (int8, PK)
 `user_id` (uuid, FK): Link `auth.users`. CRITICAL: Use `auth.getUser()`.
 `car_name` (text, NN)
 `tune_type` (text, NN)
 `settings` (jsonb, NN): Tuning obj.
 `share_code` (text, Nullable)
 `created_at` (timestamptz)

# Critical Rules
1. **Supabase:**
   Client: `@/utils/supabase/client`.
   Server: `@/utils/supabase/server`.
   Security: NO `service_role` in client.
2. Mobile UX:
   Inputs: `inputmode="decimal"`.
   Layout: `flex-col`. Buttons min 44px.
3. Standards:
   `app/` dir ONLY.
   Strict TS interfaces.
   Feedback: Toasts, NO `alert()`.