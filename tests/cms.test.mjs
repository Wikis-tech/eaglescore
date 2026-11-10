import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("admin login path and editor exist",()=>{assert.ok(existsSync("src/app/admin/eaglescorelogin/page.tsx"));assert.ok(existsSync("src/app/admin/landing-editor/page.tsx"))});
test("content model includes all major landing sections",()=>{const t=read("src/lib/landing-content.ts");for(const section of ["hero:","workflow:","features:","about:","ticker:","media:"])assert.ok(t.includes(section),section)});
test("CMS editor supports guarded server publishing and local preview",()=>{const t=read("src/components/landing-editor.tsx");const provider=read("src/components/landing-content-provider.tsx");assert.match(provider,/localStorage/);assert.match(t,/saveServer/);assert.match(t,/publishServer/);assert.match(t,/exportJson/);assert.match(t,/reset/)})
test("home route uses content provider and original images",()=>{const t=read("src/components/marketing-landing.tsx");assert.match(t,/useLandingContent/);assert.match(t,/Illustration source=/);assert.ok(t.includes("/admin/eaglescorelogin"))});
test("all original images are bundled",()=>{for(const x of ["library","reader","editor","rehearsal"])assert.ok(existsSync("public/illustrations/"+x+".svg"))});
test("landing typography removes headline nowrap at end of cascade",()=>{const css=read("src/components/landing.css");assert.ok(css.includes("white-space:normal"))});
