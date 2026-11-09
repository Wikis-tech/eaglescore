# EagleScore Step 2 manual QA

Run `npm install && npm run check` before deployment, then manually check:

1. Landing and login demo navigation.
2. Library search for Amazing Grace, category filters and no-result view.
3. Instrument selection including B-flat clarinet **written key A major** for G-major concert example.
4. Reader previous/next boundaries, zoom, focus view and ArrowLeft/ArrowRight navigation.
5. Download and print stay disabled on sample scores.
6. Upload wizard rejects missing file metadata, oversized files, blank titles and incomplete rights acknowledgement.
7. My Uploads lists the locally simulated pending submission.
8. Role preview switch: members and directors cannot see admin-route contents; admin can inspect review actions.
9. Simulated approval does **not** create a real published score, PDF or permission grant.
10. Collection creation/removal and favourites persist after reload in the same browser.
11. Mobile widths 375, 768 and 1024 pixels: no unusable sidebar or clipped controls.
12. Keyboard accessibility, headings, labels, focus visibility and colour contrast.
13. Offline navigation fallback, and confirm service worker never caches private file URLs.
14. Reset demo state and confirm seed data restores.
15. GitHub Actions CI green: typecheck, lint, tests, production build.

**Production blockers:** Supabase Auth/RLS, R2 private storage and malware scanning, verified copyright permissions, PDF.js reader, real versioning and server-side authorisation.
