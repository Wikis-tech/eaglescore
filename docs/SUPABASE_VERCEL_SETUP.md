# EagleScore — Manual Supabase + Vercel connection

**Scope:** exact steps for project owner using their own Supabase dashboard. No need to connect Supabase to ChatGPT. Keep SQL in GitHub and paste reviewed files yourself.

## 0. Safeguards
- Never paste secrets into ChatGPT, GitHub, commit messages or the Supabase SQL Editor.
- Confirm the correct Supabase project by its **project ref in the dashboard URL** before EACH manual write. Do not use Campus Link, Angel OS or any other project.
- Run the database steps first in a fresh EagleScore project, then configure authentication and a Vercel PREVIEW. The existing live Step 2 site remains untouched until testing passes.
- Do not merge/deploy the Step 3 branch automatically yet. Only the first dedicated EagleScore project should receive these scripts.
- Supabase Studio SQL Editor runs privileged SQL; only an approved project owner should run the bootstrap files.

## 1. SQL Editor setup (fresh EagleScore project)
1. Log in at https://supabase.com/dashboard and select your **eaglescore** project.
2. Confirm its ref, then navigate to **SQL Editor → New query**.
3. Open GitHub file \`supabase/manual/01_preflight_READ_ONLY.sql\`, copy the complete contents and Run.
4. If \`eaglescore_profiles\` or \`eaglescore_scores\` is non-null, STOP: it is not a clean install.
5. Open \`supabase/migrations/20261110120000_eaglescore_foundation.sql\` at the approved Step 3 GitHub branch. Copy *everything*, paste into a **new** SQL Editor query, and Run **once**.
6. Run \`supabase/manual/02_post_install_VERIFY_READ_ONLY.sql\`. Confirm 18 tables, RLS on all of them, and the listed privileges.
7. Visit **Database → Security Advisor** and check any warnings. Record migration filename, GitHub commit and execution date. Do not rerun the foundation on an already provisioned DB.

## 2. Configure Supabase Auth
1. Open **Authentication → Providers → Email**. Keep email/password login enabled and email verification required. For invite-only access, disable public self-registration / new signups (check the current dashboard wording; role access is also blocked by pending profiles/RLS).
2. In **Authentication → URL Configuration**, set Site URL to \`https://eaglescore-xi.vercel.app\` when testing production, OR your dedicated preview origin for preview testing.
3. Add explicit allowed callback redirects. At minimum \`https://eaglescore-xi.vercel.app/auth/confirm\`, \`https://eaglescore-xi.vercel.app/auth/callback\`, and the exact Vercel preview URL paths you actually intend to test. Prefer exact origins over broad wildcard rules.
4. Under **Authentication → Email Templates**, adjust the *Invite user* template and *Reset Password* template for SSR token-hash links. The link must reach the app's \`/auth/confirm\` endpoint:
   - Invite: \`<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/auth/set-password">Accept EagleScore invitation</a>\`
   - Recovery: \`<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/set-password">Reset EagleScore password</a>\`
   - If you support preview email flows, configure the template with the documented \`{{ .RedirectTo }}\` variable and test it, or keep links anchored to the canonical domain. Do not trust a free-form \`next\` host.
5. Check the email provider / SMTP settings. Supabase default email delivery can have restrictions; configure an authorised SMTP provider for real usage.
6. In **Authentication → Multi-Factor Authentication**, enable TOTP. Require administrator enrolment before access to sensitive routes.

Docs: https://supabase.com/docs/guides/auth/server-side/nextjs , https://supabase.com/docs/guides/auth/auth-email-templates , https://supabase.com/docs/guides/auth/redirect-urls

## 3. First trusted administrator
1. Get explicit leadership approval for the initial admin email.
2. In SQL Editor run \`supabase/manual/03_prepare_FIRST_ADMIN_INVITATION.sql\` **after replacing the placeholder**.
3. Go to **Authentication → Users → Invite user** and send an invitation to that exact email.
4. User opens the invite link and sets a strong password (at least 12 characters). Confirm both \`auth.users.email_confirmed_at\` and \`profiles.status\` become verified/active.
5. Run \`supabase/manual/05_check_INVITATION_AFTER_ACCEPT_READ_ONLY.sql\` with the same email, and verify results.
6. If the invite is verified but still pending, **stop and inspect**. An optional reviewed recovery script is at \`supabase/manual/06_reconcile_VERIFIED_INVITATION_OPTIONAL.sql\`; it requires a valid, unexpired pending invitation and a verified user and grants only the member role. Re-run the read-only check after reconciliation.
7. Only then run \`supabase/manual/04_grant_FIRST_SUPER_ADMIN.sql\` after replacing the placeholder. This script checks confirmation, accepted invitation, active profile and exact email before assigning the role.
8. Sign in as admin at \`/admin/eaglescorelogin\`; complete TOTP setup at \`/auth/mfa\`. No unverified account receives elevated access.

## 4. Configure Vercel environment variables
1. Open https://vercel.com/ → team **Campus Link** → project **eaglescore** → **Settings → Environment Variables** (sometimes labeled Environment Variables under Project Settings).
2. In Supabase project dashboard, open **Project Settings → API Keys** or **Connect** (UI naming varies) and identify project URL and **publishable key**. Get the server-only **secret key** only if you are ready to enable privileged admin APIs.
3. Create these variables in Vercel:
   - \`NEXT_PUBLIC_SUPABASE_URL\` = URL of this exact EagleScore Supabase project (e.g. \`https://PROJECT_REF.supabase.co\`).
   - \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\` = the \`sb_publishable_...\` key for that project.
   - \`SUPABASE_SECRET_KEY\` = the \`sb_secret_...\` key for the SAME project; **sensitive, server only**.
   - \`NEXT_PUBLIC_SITE_URL\` = \`https://eaglescore-xi.vercel.app\` or a selected canonical app origin.
4. Mark the secret key Sensitive and use the narrowest environment scope possible. Never put it in \`NEXT_PUBLIC_\` and never add it to GitHub.
5. Start with **Preview** environment only. Vercel requires a new deployment/redeployment to read changed variables. Build and test PR #4 / the Step 3 integration branch, then promote a reviewed commit later.
6. Production variables can be added after successful preview tests. Make sure preview and production keys point at the intended database project. Do not accidentally attach Campus Link credentials to EagleScore.
7. Never expose Vercel project's environment variable values in screenshots or logs.

## 5. Connect code safely
- The Next.js app reads \`NEXT_PUBLIC_SUPABASE_URL\` and \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\` through \`src/lib/supabase/config.ts\`.
- Browser client: \`src/lib/supabase/client.ts\`.
- SSR cookie client: \`src/lib/supabase/server.ts\`, session proxy: \`src/proxy.ts\`.
- Privileged server-only client: \`src/lib/supabase/admin.ts\`.
- Member auth gates: \`src/lib/auth/access.ts\`.
- Login: \`/login\`; Admin login: \`/admin/eaglescorelogin\`; MFA: \`/auth/mfa\`.
- Admin invitations: \`/api/admin/invitations\`; content CMS: \`/api/admin/landing\`.
- Public homepage remains accessible, while authenticated routes require verified active membership and RLS enforcement.

## 6. Test before release
- Uninvited user and suspended user cannot access private pages.
- Member cannot view another member's draft or assign roles.
- Director cannot become admin by editing request headers or client state.
- Admin without completed MFA cannot access admin APIs.
- Admin with MFA can invite, save CMS draft, publish after review, and inspect audit logs.
- Reset emails and invites open the proper callback and never redirect to an external host.
- Direct refresh of dashboard/auth routes works; PWA/offline cache never stores private documents.
- Run all CI checks, the isolated Postgres RLS smoke test, and visual mobile tests before production deployment.

## 7. Troubleshooting
| Symptom | Check |
|---|---|
| Auth not configured | Vercel environment variables spelling/scope and redeploy |
| Invalid API key | Project ref/key mismatch; use publishable not secret in browser |
| Redirect not allowed | Supabase Authentication → URL Configuration |
| Recovery link fails | Email template must use \`token_hash\` and \`/auth/confirm\` |
| User stuck pending | Invitation registered before confirmation? inspect \`05_check...\` and auth trigger |
| Admin bounced to dashboard | No \`super_admin\` role, inactive profile, or incorrect project |
| Admin bounced to MFA | TOTP not yet enrolled/verified |
| Client 403 on private table | RLS, email status, role and privileges |
| Migration already exists | Don't rerun; inspect and create a new forward-only migration |
| Secret present in client code | Block deployment, rotate it in Supabase, audit history |

This guide does not claim the actual EagleScore project has been modified or integration tested.
