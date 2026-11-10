# EagleScore Step 2 — Local content studio

## Routes
- Public homepage: /
- Admin-entry route: /admin/eaglescorelogin
- Browser-local content studio: /admin/landing-editor

## Exactly what is editable in this stage
Hero copy, navigation labels, call-to-action copy, ticker items, step-by-step workflow labels and descriptions, feature headings and text, about copy, footer tagline, and curated illustration selections.

## Boundaries
This is a UI demonstration. Any visitor can visit the studio URL: it is intentionally *not* presented as secure administrator access. Do not place private or sensitive content in the demo. The editor stores drafts only in that browser's localStorage; they do **not** publish globally, modify the GitHub repository, or affect other visitors. There is no password check, server-side enforcement, media uploading, or Supabase connectivity.

Step 3 must implement Supabase Auth with MFA for real admins, server-validated role checks, versioned published/draft content in PostgreSQL, RLS, approvals and audit logs. The final CMS login can then replace the explanatory demo entry page.

## Manual test plan
1. Visit /admin/eaglescorelogin and verify security warning is visible.
2. Open local CMS preview.
3. Edit hero headline; open / in the **same browser** and verify local preview reflects change.
4. Reload and confirm the draft persists.
5. Open / in another private window and ensure it still shows defaults.
6. Switch to other sections and modify workflow, features, about, footer and image selectors.
7. Export JSON; validate it contains only copy and curated media keys.
8. Reset content and verify the homepage reverts in the same browser.
9. Verify mobile layout at 360, 390, 768, 1024 and 1440 px.
10. Verify no website content is claimed to be published globally.
