# EagleScore database migrations

All SQL schema changes must be committed here, reviewed, and applied only to the **dedicated** EagleScore project after project identity verification.

- \`migrations/20261110120000_eaglescore_foundation.sql\`: complete proposed data model, invitations and activation trigger, RLS.
- \`tests/rls-smoke.sql\`: test expectations for app membership and policy isolation.
- Application routes are wired to Supabase but no actual EagleScore project was accessible through the currently connected account as of 2026-11-10.

**Never apply this migration to Campus Link, Angel OS, or any other Supabase project.**

For initial bootstrap, create an invitation for the first church-approved administrator, send an invite using the Supabase Auth admin interface, ensure the email becomes verified and the profile becomes active, then assign a super_admin row through a trusted privileged connection. Enable TOTP before visiting the admin panel.

All later migrations should be additive and forward-only. Never paste passwords or service keys in SQL or commit them to Git.
