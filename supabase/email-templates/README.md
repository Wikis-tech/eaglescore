# EagleScore auth email templates

Paste these reviewed templates into your OWN EagleScore Supabase project:
- Supabase Dashboard → Authentication → Email Templates → Invite user → replace email body with `invite.html`
- Supabase Dashboard → Authentication → Email Templates → Reset Password → replace email body with `recovery.html`

Both use Supabase-supported `{{ .SiteURL }}` and `{{ .TokenHash }}` variables and intentionally direct the user to the Next.js SSR `/auth/confirm` endpoint, which calls `verifyOtp` and sets an authenticated session.

**The Site URL must point at an app deployment containing this route**, not the old Step 2 demo. For first-branch preview testing, use your reviewed Vercel preview alias and ensure the invited tester has access through Vercel's deployment protection. When deploying to production, update the Supabase Site URL to the production EagleScore URL before sending production invites.

Do not send a default confirmation email to the old Step 2 deployment; it cannot establish the new SSR auth session. Do not include real credentials, invitation tokens or OTPs in GitHub commits.

If the email client prefetches confirmation links, Supabase may consume a single-use link early; test with a trusted email account and consult Supabase's documentation on email prefetching and OTP alternatives if necessary.
