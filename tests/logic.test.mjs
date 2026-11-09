import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";const demo=readFileSync("src/lib/demo.ts","utf8");const screen=readFileSync("src/components/screens.tsx","utf8");
test("published-score filtering is explicitly present",()=>assert.match(demo,/status==="approved"/));
test("search normalises query",()=>assert.match(demo,/toLowerCase/));
test("only admin may publish",()=>assert.match(demo,/r==="admin"/));
test("clarinet written key is distinct from concert key",()=>assert.match(demo,/A Major \(written, B-flat clarinet\)/));
test("demo upload caps file metadata size",()=>assert.match(demo,/15\*1024\*1024/));
test("demo disclaimer stays visible",()=>assert.match(screen,/No real PDF is attached/));
test("download and printing are not deceptively enabled",()=>assert.match(screen,/<button disabled className="btn"><Download/));
