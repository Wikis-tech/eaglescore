import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("real public signup without demo roles",()=>{
 assert.ok(existsSync("src/app/signup/page.tsx"));
 const s=read("src/components/auth-forms.tsx");
 assert.match(s,/auth\.signUp/);
 assert.match(s,/emailRedirectTo/);
 assert.doesNotMatch(s,/Eaglescore2711/);
});
test("exclusive email role and MFA for admin",()=>{
 const a=read("src/lib/auth/access.ts");
 assert.match(a,/admin@eaglescore\.com\.ng/);
 assert.match(a,/aal2/);
 const sql=read("supabase/migrations/20261110170000_public_signup_single_admin.sql");
 assert.match(sql,/app_private\.is_admin/);
 assert.doesNotMatch(sql,/Eaglescore2711/);
});
test("member manager cannot grant another superadmin",()=>{
 assert.doesNotMatch(read("src/app/api/admin/members/route.ts"),/\["member","music_director","super_admin"\]/);
});
test("all admin pages enforce server-side authorization",()=>{
 for(const name of ["dashboard","members","landing-editor","submissions","reviews","scores","audit-logs","settings"])
 assert.match(read("src/app/admin/"+name+"/page.tsx"),/requireAdmin\(\)/);
});
