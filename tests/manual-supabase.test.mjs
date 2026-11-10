import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const read=(file)=>readFileSync(file,"utf8");
const root="supabase/manual/";
test("all manual setup SQL scripts are version controlled",()=>{
 for(const name of ["01_preflight_READ_ONLY.sql","02_post_install_VERIFY_READ_ONLY.sql","03_prepare_FIRST_ADMIN_INVITATION.sql","04_grant_FIRST_SUPER_ADMIN.sql","05_check_INVITATION_AFTER_ACCEPT_READ_ONLY.sql","06_reconcile_VERIFIED_INVITATION_OPTIONAL.sql"])
 assert.ok(existsSync(root+name),name);
});
test("first admin bootstrap requires a verified, invited, active member",()=>{
 const sql=read(root+"04_grant_FIRST_SUPER_ADMIN.sql");
 assert.match(sql,/email_confirmed_at is not null/);
 assert.match(sql,/accepted_at is not null/);
 assert.match(sql,/status='active'/);
 assert.match(sql,/REPLACE_WITH_APPROVED_ADMIN_EMAIL/);
});
test("optional invitation reconciliation cannot promote roles",()=>{
 const sql=read(root+"06_reconcile_VERIFIED_INVITATION_OPTIONAL.sql");
 assert.match(sql,/expires_at>now\(\)/);
 assert.match(sql,/email_confirmed_at is not null/);
 assert.match(sql,/'member'/);
 assert.doesNotMatch(sql,/'super_admin'/);
});
test("auth confirmation uses Supabase token hash verification",()=>{
 const src=read("src/app/auth/confirm/route.ts");
 assert.match(src,/verifyOtp/);
 assert.match(src,/token_hash/);
 assert.match(src,/safeNext/);
});
test("manual guide includes Supabase Vercel and environment variable names",()=>{
 const md=read("docs/SUPABASE_VERCEL_SETUP.md");
 for(const name of ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","SUPABASE_SECRET_KEY","NEXT_PUBLIC_SITE_URL"])
 assert.ok(md.includes(name),name);
 assert.ok(md.includes("Authentication"));
 assert.ok(md.includes("Environment Variables"));
});
