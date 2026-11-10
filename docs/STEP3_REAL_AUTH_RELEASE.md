# EagleScore — Step 3 Real Authentication Release

**Purpose:** activate the existing EagleScore schema, signed-in members, trusted Super Admin and CMS without exposing sample users.

## Why production previously showed the demo

- The production Vercel alias `eaglescore-xi.vercel.app` was on Step 2 commit `2277de1`.
- No Supabase environment variables existed in the Vercel eaglescore project at the time of inspection.
- Step 3 pages still rendered mock score records and a client role switcher. This branch replaces the live routes with server-authorised queries and truthful empty states.

## What is implemented in the release candidate

- `/login` and `/admin/eaglescorelogin`: Supabase sign-in, verified active membership check.
- `/auth/confirm`: email token-hash validation; `/auth/callback`: PKCE exchange.
- `/auth/set-password`: invited-user setup and password recovery.
- `/auth/mfa`: TOTP enrolment QR display and challenge verification.
- All private member routes: require confirmed active profile + server role checks.
- All admin routes: require Super Admin role and MFA assurance level 2.
- Privileged admin invitations and member management backed by database APIs.
- CMS publish/save endpoints with role/MFA checks; public homepage never reads a locally stored admin draft.
- All active member/admin screens use real database queries; no demo logins, mock scores or role-switcher UI.
- Uploads, file reading and notation composition remain disabled until Steps 4 and 5 rather than pretending to save files.

## Required human setup before production release

1. Confirm your `eaglescore` Supabase database and foundation tables are already present. **Never rerun the foundation migration.**
2. You already ran `03_prepare_FIRST_ADMIN_INVITATION.sql` successfully with your chosen admin email. **Do not rerun 03** if its invitation remains pending.
3. Open **Supabase Dashboard → eaglescore → Authentication → Users → Invite user**. This is a Supabase dashboard action, NOT a page on `eaglescore-xi.vercel.app`.
4. Use the SAME approved email as your script 03. The dashboard URL for the project shown in your screenshots is `https://supabase.com/dashboard/project/fokvotvnbgoqjnbhguef/auth/users` (verify before taking action).
5. Configure Supabase **Authentication → URL Configuration** Site URL and Redirect URLs to include the exact deployed Step 3 origin and its `/auth/confirm` and `/auth/callback` routes.
6. Under **Authentication → Email Templates**, configure custom SSR token-hash links. For Invite user, use an absolute URL like `https://YOUR-APP-ORIGIN/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/auth/set-password`; for Recovery, use `type=recovery`. Never publish or share real token hashes.
7. Check invitation email deliverability; configure a real SMTP provider if default Supabase email limits prevent delivery.
8. After opening the invitation and confirming the account, run manual read-only script 05 using the SAME email and ensure email_verified=true, member_status=active, invite_accepted_at present, and member role assigned.
9. Only then run script 04 with the same approved email to grant Super Admin. Script 06 is optional recovery, NOT part of normal onboarding.
10. Use Vercel project `eaglescore` → Settings → Environment Variables. Add the following values directly in Vercel (Preview first):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_EAGLESCORE_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable API key from the SAME project |
| `SUPABASE_SECRET_KEY` | Server-only secret key; mark sensitive; never expose in browser or GitHub |
| `NEXT_PUBLIC_SITE_URL` | The exact deployment origin used by email redirects |

11. Redeploy the candidate branch after adding variables. A Vercel build without them can succeed but authentication will remain unavailable.
12. Sign in as the trusted admin, enrol TOTP via `/auth/mfa`, and verify access to `/admin/dashboard`, `/admin/members` and `/admin/landing-editor`.

## Required acceptance tests

- [ ] Anonymous `/dashboard` and `/admin/dashboard` redirect to real login.
- [ ] Login never offers a `Preview as Admin` or `Enter demonstration` bypass.
- [ ] A pending or uninvited account cannot enter member workspace.
- [ ] Verified active member can open a real empty library and collections list.
- [ ] A normal member cannot access admin routes, invitations or role mutation APIs.
- [ ] Super Admin without MFA is redirected to the MFA setup screen.
- [ ] Enrolled Super Admin with correct TOTP can administer members.
- [ ] Password-recovery link and invitation link establish valid sessions.
- [ ] CMS draft is not returned publicly and can only be published by verified Super Admin with MFA.
- [ ] Sign-out and account suspension remove access to protected pages.
- [ ] Mobile/tablet interface, responsive marketing layout and PWA fallback remain usable.
- [ ] GitHub CI is green and Supabase Security Advisor reports no unresolved critical issues.

## Release safety

Do **not** merge to main or replace the production domain until the environment variables are present and the account flow has been verified end-to-end against the real EagleScore database. CI proves the code builds and isolated RLS tests pass; it cannot verify email delivery or real-user MFA without the project connection.

The previous GitHub SQL scripts remain the source of truth. No new foundation migration is required for this frontend release.