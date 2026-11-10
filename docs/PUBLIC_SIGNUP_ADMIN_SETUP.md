# EagleScore — Public registration and exclusive administration

Anyone may register an account, but must confirm ownership of their email before being activated. Every verified registration receives only the ordinary member role.
Only the confirmed Auth account for admin@eaglescore.com.ng with an explicit super_admin database assignment, active profile and MFA AAL2 can enter the protected administrator interface.

## Operator steps
1. Apply only the ADDITIVE migration supabase/migrations/20261110170000_public_signup_single_admin.sql. The foundation was already installed and must NOT be rerun.
2. Run read-only supabase/manual/08_VERIFY_PUBLIC_SIGNUP_READ_ONLY.sql.
3. Supabase -> Authentication -> Providers -> Email: enable public signup, require email confirmation; configure SMTP, rate limiting and CAPTCHA.
4. Supabase -> Authentication -> Email Templates -> Confirm signup: paste supabase/email-templates/confirmation.html; configure recovery/invite templates from GitHub too.
5. Configure Supabase Site URL and redirect allowlist for the exact Vercel deployment and /auth/confirm and /auth/callback paths.
6. Register the approved admin mailbox through Supabase Auth; confirm the email.
7. ONLY after confirmation run supabase/manual/07_BOOTSTRAP_EXCLUSIVE_SUPER_ADMIN.sql (this never sets a password).
8. Set a new strong unique admin password privately through Supabase Auth. Do not reuse a password exposed in a conversation or commit it to source.
9. In Vercel set the publishable and sensitive server-secret API keys for the correct EagleScore Supabase project. Redeploy Preview and test before production.
10. Enrol MFA at /auth/mfa before visiting /admin/dashboard or /admin/landing-editor.

## Administration
The protected admin navigation includes membership/roles, invitations, landing CMS, read-only scores/submissions/reviews and audit logs. Real score approvals and file workflows require Steps 4–6 and must not be falsely presented as implemented.

## Security
Admin route URLs are not secrets; normal users do not see links to them, and server-side authorisation denies access even when URLs are guessed. Passwords are never embedded in SQL, GitHub or Vercel environment variables.