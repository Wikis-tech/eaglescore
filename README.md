# EagleScore

Digital Music Library & Score Management System for **MFM Lagos Region One Eagle Orchestra**.

## Status

**Step 2 frontend demonstration**. The app uses browser-local demonstration records. There is no real authentication, database, file storage, music PDF, right-to-download enforcement, copyright verification or production role security yet. Never use the role preview selector as a security mechanism.

## Getting started

Requirements: Node.js 22 and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

CI runs the same checks in `.github/workflows/frontend-ci.yml`.

## Pages

Landing, login, privacy, terms, dashboard, library, dynamic score details and reader, upload wizard, simple text/notation editor mock, my uploads, collections, settings, and admin dashboard, submissions, reviews, scores, members, audit logs, and settings.

## Project structure

- `src/app`: Next.js App Router
- `src/components`: shared shell, screens, demo state, access preview guard
- `src/lib/demo.ts`: typed safe sample data and search helpers
- `public/sw.js`: online-first navigation with offline fallback; does not cache private scores
- `supabase/`: version-controlled home for **future** SQL migrations and policy tests
- `tests/`: source and structure smoke tests
- `QA_CHECKLIST.md`: manual checks

## Safety and continuity

The sample uploader only records a filename in browser local storage; it does not upload the file. The score reader uses fictitious notation, not an authentic edition. Admin preview is not access control. All production access checks must be implemented at the API/database layer in Step 3.

Do not commit real church membership details, secrets or copyright-restricted sheet music. Database migrations should be reviewed and tested before application.

## Deployment

Do not deploy as an authenticated production service yet. When configuring Vercel, select this repo as root and use the framework preset Next.js. The deployment should be labelled a frontend demonstration. Do not add service keys until Step 3, and use environment variables for secrets.
