# EagleScore SQL change policy

The repository is the source of truth for EVERY application database change, including future steps (storage policies, approval transactions, new indexes, functions, triggers, data migrations and fixes).

1. Create a descriptive, timestamped, append-only SQL migration in `supabase/migrations/` on a dedicated GitHub feature branch.
2. Add separate repeatable **read-only** post-install verification queries in `supabase/manual/`; add explicit operator-only bootstrap scripts there if necessary.
3. Review scope and table names against the dedicated EagleScore project; reject any script that references another project.
4. Verify the full migration against a disposable PostgreSQL/Supabase test environment and run RLS/security advisor checks.
5. Open a pull request and obtain review. Only then copy the exact GitHub SQL file into Supabase SQL Editor and run it ONCE.
6. Save the executed Git commit SHA, migration filename, execution timestamp and execution result in an operator deployment record. SQL Editor runs are **not** automatically registered in the Supabase CLI migration history; avoid mixing undocumented manual and CLI migration operations.
7. Never amend an already executed migration. Create a new forward-only migration for fixes.
8. Avoid destructive commands in instructions for non-technical operators; any destructive change requires backups, a rollback plan and explicit approval.
9. Keep secret API keys, emails, private music scores and production member data out of SQL files, fixtures and logs.

**File conventions**
- `supabase/migrations/YYYYMMDDHHMMSS_description.sql` — permanent schema history.
- `supabase/manual/NN_action.sql` — privileged manual setup, bootstrap and read-only diagnostics.
- `supabase/tests/` — disposable CI fixtures, negative RLS tests and expected conditions.
- `docs/SUPABASE_VERCEL_SETUP.md` — user-facing setup/runbook.

**Connection boundary:** Using SQL Editor is acceptable for this onboarding, but it is NOT the same as connecting the Supabase MCP, creating a CLI migration ledger, or completing real authentication/browser testing.
