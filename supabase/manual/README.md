# Manual Supabase SQL Editor scripts

Use the files in this exact sequence. These are **operator scripts**, separate from immutable schema migrations. They must never be run against other projects.

1. `01_preflight_READ_ONLY.sql` — inspect target DB before any writes.
2. `../migrations/20261110120000_eaglescore_foundation.sql` — foundational schema, once only. **Run in a fresh dedicated EagleScore project**, not an existing populated database.
3. `02_post_install_VERIFY_READ_ONLY.sql` — verify all tables/RLS/grants.
4. `03_prepare_FIRST_ADMIN_INVITATION.sql` — edit approved email, execute once.
5. In Supabase dashboard, Authentication > Users > Invite user; use the SAME email.
6. Configure custom invite and recovery email templates and accept invite on the intended EagleScore domain.
7. `05_check_INVITATION_AFTER_ACCEPT_READ_ONLY.sql` — inspect verified profile state.
8. If an existing verified user remains pending, use `06_reconcile_VERIFIED_INVITATION_OPTIONAL.sql` only after checking its safety conditions; run `05_check...` again.
9. `04_grant_FIRST_SUPER_ADMIN.sql` — only after verified, active invitation; enrol MFA.
10. Test admin and member login on a Vercel PREVIEW using the correct EagleScore environment.

**Do not rerun the migration to fix a partial error**. Preserve the error and inspect the existing schema. A SQL Editor execution does not automatically create a Supabase migration-history entry, so document the timestamp and commit SHA of the file you applied and use future forward-only migrations.

SQL file naming: `supabase/migrations/YYYYMMDDHHMMSS_description.sql` for immutable schema changes; `supabase/manual/` for single-use, verification and bootstrap scripts. Never commit passwords, keys or member lists.
