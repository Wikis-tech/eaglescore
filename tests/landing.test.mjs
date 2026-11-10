import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";const home=readFileSync("src/components/marketing-landing.tsx","utf8"),css=readFileSync("src/components/landing.css","utf8");test("landing has accessible navigation and skip link",()=>{assert.match(home,/aria-label="Main navigation"/);assert.match(home,/Skip to content/)});test("landing has responsive and reduced motion rules",()=>{assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/@media\(max-width:520px\)/)});test("landing links to valid app entry paths",()=>{assert.match(home,/href="\/login"/);assert.match(home,/href="\/dashboard"/)});test("landing motion control toggles animation",()=>{assert.match(home,/setPlaying/);assert.match(css,/es-visual-paused/)});

test("large landing headings cannot expand beyond their parent grid",()=>{
 const containment=css.slice(css.indexOf("Landing typography containment hotfix"));
 assert.match(containment,/\.es-landing \.es-section-intro\s*\{[^}]*display:\s*flex/);
 assert.match(containment,/\.es-landing \.es-section-intro h2,[\s\S]*?overflow-wrap:\s*anywhere/);
 assert.match(containment,/\.es-landing \.es-about\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 1fr\)/);
 assert.match(containment,/@media \(max-width: 820px\)/);
 assert.match(containment,/@media \(max-width: 520px\)/);
});
