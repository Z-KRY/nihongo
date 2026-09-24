#!/usr/bin/env node
// Build me/reader.html from templates/reader.html, injecting the learner's
// own vocabulary and grammar floor.
//
// The page generates stories itself (the `sample` capability), so it needs
// the same constraints the /nihongo-story skill works under — otherwise it
// would write at whatever level it felt like, which is the one thing a
// graded reader must never do.
//
//   node scripts/build-reader.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "templates", "reader.html");
const WK = join(ROOT, "me", "wanikani.json");
const GRAMMAR = join(ROOT, "reference", "story-grammar.md");
const OUT = join(ROOT, "me", "reader.html");

if (!existsSync(WK)) {
  console.error(
    `me/wanikani.json not found — run this first:\n\n` +
    `  node scripts/wanikani-pull.mjs`
  );
  process.exit(1);
}

const wk = JSON.parse(readFileSync(WK, "utf8"));

// Guru (stage 5) and above only. Apprentice items are still being drilled on
// WaniKani and get recognised inconsistently; building stories from them
// produces text that reads as unknown vocabulary.
const solid = wk.items.filter(i => i.solid);

const vocab = solid
  .filter(i => i.type === "vocabulary")
  .map(i => ({ w: i.characters, r: i.readings[0] ?? "", m: i.meanings.slice(0, 2).join(", ") }));

const kanji = solid.filter(i => i.type === "kanji").map(i => i.characters);

// The floor, minus the prose. Everything between "## Allowed" and the
// "## Not yet" heading is what stories may use.
const md = readFileSync(GRAMMAR, "utf8");
const allowed = md.slice(md.indexOf("## Allowed"), md.indexOf("## Not yet")).trim();
const forbidden = md.slice(md.indexOf("## Not yet"), md.indexOf("## Raising the floor")).trim();

let html = readFileSync(TEMPLATE, "utf8");
const inject = (token, value) => {
  if (!html.includes(token)) { console.error(`Template is missing ${token}`); process.exit(1); }
  html = html.replace(token, JSON.stringify(value));
};

inject("__VOCAB__", vocab);
inject("__KANJI__", kanji);
inject("__GRAMMAR__", `${allowed}\n\n${forbidden}`);
inject("__LEVEL__", wk.level);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);

console.log(
  `Level ${wk.level} · ${vocab.length} solid vocabulary · ${kanji.length} solid kanji\n` +
  `→ me/reader.html (${(html.length / 1024).toFixed(0)} KB)\n\n` +
  `Publish it with the Artifact tool to update the reader.`
);
