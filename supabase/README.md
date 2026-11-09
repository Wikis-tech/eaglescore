# Supabase migrations — Step 3 reserved

This directory is the version-controlled home for **all future PostgreSQL migrations, RLS policies, indexes and seed scripts**.

No live Supabase project has been connected. Do not paste credentials into this repository. The first schema migration will be authored and tested in Step 3 once the Supabase project and final data model are approved.

Recommended convention:
- `supabase/migrations/YYYYMMDDHHMMSS_description.sql`: sequential immutable migrations
- `supabase/seed.sql`: explicitly non-sensitive development seeds (if needed)
- `supabase/tests/`: database policy tests
- `.env.example`: placeholder variable names only

**Never commit** `.env.local`, service-role keys, database passwords, production user records or real copyrighted scores.

Deployment principle: migrations are reviewed in PRs and applied through an explicit migration workflow. Do not auto-apply migrations from the frontend CI workflow.
