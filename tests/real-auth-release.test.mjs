import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("workspace has no demo role selection",()=>{
 const shell=read("src/components/shell.tsx");
 assert.doesNotMatch(shell,/useDemo|Demo only|Preview as|step2-demo/);
 assert.match(shell,/LogoutButton/);
});
test("root no longer exposes seed accounts",()=>{
 assert.doesNotMatch(read("src/app/layout.tsx"),/DemoProvider/);
});
test("member and administrator routes require real identity",()=>{
 for(const path of ["dashboard","library","library/[scoreId]","library/[scoreId]/read","upload","editor","my-uploads","collections","settings"])assert.match(read("src/app/"+path+"/page.tsx"),/requireMember\(\)/,path);
 for(const path of ["dashboard","submissions","reviews","scores","audit-logs","settings","members","landing-editor"])assert.match(read("src/app/admin/"+path+"/page.tsx"),/requireAdmin\(\)/,path);
});
test("workspaces use database not seeded sample records",()=>{
 const real=read("src/components/real-workspace.tsx");
 assert.match(real,/createClient/);
 assert.match(real,/No records available yet/);
 assert.doesNotMatch(real,/seed|sampleWrittenKey|setState/);
});
test("public landing does not use locally drafted CMS content",()=>{
 const p=read("src/components/landing-content-provider.tsx");
 assert.match(p,/if\(editor\)\{/);
 assert.match(p,/fetch\("\/api\/landing"/);
});
test("authentication includes confirmation, recovery, and MFA",()=>{
 assert.match(read("src/app/auth/confirm/route.ts"),/verifyOtp/);
 assert.match(read("src/components/auth-forms.tsx"),/signInWithPassword/);
 assert.match(read("src/components/auth-forms.tsx"),/resetPasswordForEmail/);
 assert.match(read("src/components/auth-forms.tsx"),/mfa\.verify/);
});
