# EagleScore — Digital Orchestra Music Library

**Organisation:** MFM Lagos Region One Eagle Orchestra  
**Platform:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Supabase Auth/PostgreSQL + PWA  
**Repository:** `Wikis-tech/eaglescore`  
**Stage:** Step 3 implementation branch — NOT yet connected to the actual EagleScore Supabase project.

## Mission

EagleScore replaces scattered paper scores with a controlled, searchable digital archive. Orchestra members can find approved hymns, arrangements and instrument parts. Uploaders retain ownership of drafts, music directors review musical quality, and a super admin authorises publication after music and copyright checks. A public editorial homepage introduces the project.

## Screens and routes

- Public: `/`, `/login`, `/privacy`, `/terms`.
- Member: `/dashboard`, `/library`, `/library/[scoreId]`, `/library/[scoreId]/read`, `/upload`, `/editor`, `/my-uploads`, `/collections`, `/settings`.
- Admin: `/admin/eaglescorelogin`, `/admin/dashboard`, `/admin/reviews`, `/admin/submissions`, `/admin/scores`, `/admin/members`, `/admin/audit-logs`, `/admin/landing-editor`.
- Auth: `/auth/callback`, `/auth/set-password`, `/auth/mfa`.
- APIs: `/api/me`, `/api/landing`, `/api/admin/landing`, `/api/admin/invitations`.

**Important:** Step 2 music-library data and score reader remain explicitly illustrative. Step 3 creates the schema and real access-control framework; live score ingestion, file validation, private R2 links, printing and licensing workflows will be implemented in Step 4/5/6. Do not represent demo files as uploaded or legally cleared.

## Architecture

```
Browser (Next.js React / Tailwind / PWA)
  ├── Public landing → GET /api/landing → published CMS JSON (Supabase)
  ├── Login → Supabase Auth (cookie-based PKCE SSR)
  ├── Member pages → server-side getUser() → profile status + user_roles → RLS
  ├── Admin pages → verified user + super_admin role + MFA AAL2
  └── Protected API actions → origin check + verified admin/MFA → server-only Supabase key
                        └── PostgreSQL schema (RLS, triggers, versioned records, audit)
Future Step 4 → private R2 object storage, signed links, document scanning, malware checks
```

### Data model

| Table | Meaning |
| --- | --- |
| `profiles` | Member status, verified account linkage |
| `roles`, `user_roles` | Server-controlled authorisation roles |
| `invitations` | One-time onboarding registry with expiry |
| `works` | Musical composition/song identity |
| `arrangements` | Specific orchestra arrangement of a work |
| `scores` | Owned score record and current/published version pointers |
| `score_versions` | Versioned draft and approved content |
| `score_parts` | Full score and instrument-specific parts |
| `score_files` | Private object-storage metadata (not public blob hosting) |
| `submissions`, `reviews` | Review and publication pipeline |
| `copyright_records` | Rights basis, evidence, print/download flags |
| `collections`, `collection_items`, `favorites` | Personal rehearsal organisation |
| `audit_logs` | Privileged events |
| `landing_content` | Public published JSON vs protected admin draft |

### Algorithms and invariants

**Music deduplication (Step 4):** normalise title/hymn number/composer for candidate matches; use SHA-256 for exact file duplicates. Never reject solely by title because distinct arrangements and instrument parts may be legitimate.

**Search (Step 4):** show only approved scores with a valid published version; combine title/hymn/composer/category/instrument filters. Index searchable metadata, not copyrighted PDF content by default.

**Versioning:** `work → arrangement → score → score_version → score_part/file`. Once a version is approved it is immutable to ordinary users. An uploader edits only their own draft content; a published version remains live during any later pending revision. A final admin publication transaction must validate ownership, checks, rights, current version and reviewer roles before updating both the score and version states.

**Invitations:** an MFA-verified super admin inserts an invitation record then calls Supabase Auth invite. On email confirmation a database trigger matches an unexpired invitation, activates the profile and grants the default member role. No browser signup can grant admin or director privileges. Bootstrap admin assignment requires controlled out-of-band SQL after the first trusted member account is confirmed.

**Member authorization:** `getUser()` verifies identity; access also requires a confirmed email, active `profiles.status`, and a `user_roles` row. RLS independently limits data access. Admin access additionally requires `super_admin` and TOTP/MFA assurance level `aal2`. Browser localStorage roles are not trusted.

**CMS:** editing is previewed in the browser; PATCH creates a server draft with an optimistic version check; POST publishes only the saved server draft, increments version and emits an audit event. Public clients are granted column-level SELECT for `published`, never `draft`.

**Security:** deny-by-default RLS across all application tables; no client-side permissions for membership assignments, review decisions, publication state, audit creation or file-object access. The service key is server-only. Mutating admin endpoints verify same-origin requests, identity, role and MFA. A full security audit, rate limits and business-transaction RPCs remain required before real score uploads/publication.

## Local setup

Requirements: Node.js 22+, npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Populate only the **dedicated EagleScore Supabase project** URL and publishable key in `.env.local`. Keep `SUPABASE_SECRET_KEY` server-only. Never commit secrets or private music.

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Supabase schema deployment — NOT DONE

Migration source: `supabase/migrations/20261110120000_eaglescore_foundation.sql`.

1. Connect the **correct** EagleScore Supabase project. The currently connected connector account does not expose the project from the screenshot, so nothing has been applied to production.
2. Inspect the migration, compare with production schema and back up data. Validate it first on an isolated test database.
3. Review the project Auth email confirmation, redirect URL allowlist, SMTP delivery and disabled public sign-ups.
4. Apply the reviewed migration through the Supabase migration workflow. Keep migration history synchronized with Git.
5. Invite a trusted administrator through a controlled bootstrap process. After their email is verified and invitation accepted, grant `super_admin` with an audited, out-of-band privileged SQL statement; do not expose role-edit permissions to the browser.
6. Enrol TOTP on the admin account and test a second account as ordinary member.
7. Configure Vercel's protected environment variables, update site URL and callback settings, then deploy a **preview** first.
8. Run the RLS/IDOR/security tests and a rollback drill before promoting to production.

**Bootstrap example (run only after verifying the actual account UUID):**

```sql
insert into public.user_roles(user_id, role)
values ('<verified-trusted-admin-uuid>'::uuid, 'super_admin')
on conflict do nothing;
```

Never use a guessed UUID, a public API call or a browser-editable JWT claim to assign elevated roles.

## Security & permissions tests

- Anonymous cannot read profiles, scores, private file keys, review records, CMS drafts or audit logs.
- A logged-in member without an accepted invitation cannot use the library.
- Member A cannot read Member B's draft nor mutate their identity or role.
- Member A can edit only permitted draft columns, not `status` or `published_version_id`.
- A music director cannot grant themselves admin rights or publish.
- A super admin without AAL2 cannot access admin routes or APIs.
- MFA-verified admin can invite, save CMS draft and publish, with audit record.
- Concurrent CMS edits return 409 instead of silently overwriting the latest revision.
- Password recovery and invited-user callback reject unsafe external redirect URLs.
- Terminated/suspended profiles lose access even if their existing JWT is still valid.

## Environment and deployment safety

- `NEXT_PUBLIC_SUPABASE_URL` — public project endpoint.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — safe browser publishable key.
- `SUPABASE_SECRET_KEY` — **server-only** privileged key; never prefix `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SITE_URL` — approved canonical URL used for invitation redirects.

Until the correct project is connected, **do not promote Step 3 to production**. The current Step 2 deployment remains the usable visual demonstration.

## Next phases

Step 4: R2 private storage, upload pipeline, scoring search, scanning and copyright clearance.  
Step 5: PDF.js reader, MusicXML/VexFlow editing and export.  
Step 6: secure publication transaction, moderation and audit lifecycle.  
Step 7: threat model, automated browser/device testing, accessibility and restore drills.  
Step 8: approved production release and ongoing operations.
