#!/usr/bin/env node
// Pull WaniKani progress into me/wanikani.json and me/vocabulary.md
//
// Read-only. WaniKani's subject content is fixed and curated — there is no
// endpoint to push your own vocabulary in, so this leg is one-way by design.
//
// Token: $WANIKANI_TOKEN, or ~/.config/nihongo/wanikani.token
// Get one at https://www.wanikani.com/settings/personal_access_tokens
// (read-only scope is sufficient)
//
// Usage:  node scripts/wanikani-pull.mjs [--refresh-subjects]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ME = join(ROOT, "me");
const SUBJECT_CACHE = join(ME, "wanikani-subjects.json");
const OUT_JSON = join(ME, "wanikani.json");
const OUT_MD = join(ME, "vocabulary.md");

const API = "https://api.wanikani.com/v2";

// WaniKani SRS stages. Guru (5) is the usual "it has stuck" threshold —
// below that an item is still actively being drilled and shouldn't be
// treated as known vocabulary.
const STAGES = {
  0: "Lesson",
  1: "Apprentice 1", 2: "Apprentice 2", 3: "Apprentice 3", 4: "Apprentice 4",
  5: "Guru 1", 6: "Guru 2",
  7: "Master", 8: "Enlightened", 9: "Burned",
};
const SOLID_FROM = 5;

function token() {
  if (process.env.WANIKANI_TOKEN) return process.env.WANIKANI_TOKEN.trim();
  const path = join(homedir(), ".config", "nihongo", "wanikani.token");
  if (existsSync(path)) return readFileSync(path, "utf8").trim();
  console.error(
    `No WaniKani token found.\n\n` +
    `  1. Create one (read-only scope is enough):\n` +
    `     https://www.wanikani.com/settings/personal_access_tokens\n\n` +
    `  2. Save it:\n` +
    `     mkdir -p ~/.config/nihongo\n` +
    `     printf '%s' 'YOUR_TOKEN' > ~/.config/nihongo/wanikani.token\n` +
    `     chmod 600 ~/.config/nihongo/wanikani.token\n\n` +
    `Keep it outside the repo so it can't be committed.`
  );
  process.exit(1);
}

const TOKEN = token();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}`, "Wanikani-Revision": "20170710" },
    });
    if (res.ok) return res.json();
    if (res.status === 401) {
      console.error("WaniKani rejected the token (401). Check it hasn't been revoked.");
      process.exit(1);
    }
    if (res.status === 429) {           // rate limited: 60 req/min
      await sleep(2000 * (attempt + 1));
      continue;
    }
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  throw new Error(`giving up after retries: ${url}`);
}

// Walks pages.next_url until exhausted.
async function collection(path) {
  let url = `${API}${path}`;
  const out = [];
  while (url) {
    const page = await get(url);
    out.push(...page.data);
    url = page.pages?.next_url ?? null;
    if (url) await sleep(250);
  }
  return out;
}

async function subjects({ refresh }) {
  if (!refresh && existsSync(SUBJECT_CACHE)) {
    return JSON.parse(readFileSync(SUBJECT_CACHE, "utf8"));
  }
  process.stderr.write("Pulling subject catalogue (once; it's static content)… ");
  const raw = await collection("/subjects?types=kanji,vocabulary,kana_vocabulary");
  const map = {};
  for (const s of raw) {
    map[s.id] = {
      type: s.object,
      level: s.data.level,
      characters: s.data.characters,
      meanings: s.data.meanings.filter(m => m.accepted_answer).map(m => m.meaning),
      readings: (s.data.readings ?? []).filter(r => r.accepted_answer).map(r => r.reading),
    };
  }
  mkdirSync(ME, { recursive: true });
  writeFileSync(SUBJECT_CACHE, JSON.stringify(map));
  process.stderr.write(`${raw.length} subjects\n`);
  return map;
}

async function main() {
  const refresh = process.argv.includes("--refresh-subjects");

  const [user, subs, assignments] = await Promise.all([
    get(`${API}/user`),
    subjects({ refresh }),
    collection("/assignments?unlocked=true"),
  ]);

  const items = [];
  for (const a of assignments) {
    const s = subs[a.data.subject_id];
    if (!s || !s.characters) continue;      // radicals with image-only glyphs
    items.push({
      id: a.data.subject_id,
      type: s.type.replace("kana_vocabulary", "vocabulary"),
      characters: s.characters,
      meanings: s.meanings,
      readings: s.readings,
      level: s.level,
      srs_stage: a.data.srs_stage,
      srs: STAGES[a.data.srs_stage] ?? String(a.data.srs_stage),
      solid: a.data.srs_stage >= SOLID_FROM,
    });
  }

  items.sort((a, b) => b.srs_stage - a.srs_stage || a.level - b.level);

  const solid = items.filter(i => i.solid);
  const vocab = items.filter(i => i.type === "vocabulary");
  const kanji = items.filter(i => i.type === "kanji");

  writeFileSync(OUT_JSON, JSON.stringify({
    pulled_at: new Date().toISOString(),
    username: user.data.username,
    level: user.data.level,
    counts: {
      unlocked: items.length,
      solid: solid.length,
      vocabulary: vocab.length,
      kanji: kanji.length,
    },
    items,
  }, null, 2));

  // Human- and Claude-readable summary. The tutoring skills read this rather
  // than the JSON, so it has to stand on its own.
  const group = (list, pred) => list.filter(pred);
  const table = list => list.length
    ? "| Word | Reading | Meaning | Stage |\n|---|---|---|---|\n" +
      list.map(i => `| ${i.characters} | ${i.readings.join(", ") || "—"} | ${i.meanings.join(", ")} | ${i.srs} |`).join("\n")
    : "_none_";

  writeFileSync(OUT_MD, `# WaniKani vocabulary

Generated by \`scripts/wanikani-pull.mjs\`. **Do not edit** — re-run the script.

**${user.data.username} · level ${user.data.level}** · pulled ${new Date().toISOString().slice(0, 10)}

| | |
|---|---|
| Unlocked items | ${items.length} |
| Solid (Guru or above) | ${solid.length} |
| Vocabulary | ${vocab.length} |
| Kanji | ${kanji.length} |

## How to read this

**Guru and above (stage ≥ ${SOLID_FROM}) counts as known.** Below that the item is still
being actively drilled on WaniKani and shouldn't be assumed — it will be
recognised inconsistently, and testing it here duplicates work WaniKani is
already doing.

Never re-teach a Guru+ item as new vocabulary. Do use it freely in example
sentences — that's the point of knowing what's solid.

## Solid vocabulary — usable in examples

${table(group(vocab, i => i.solid))}

## Vocabulary still in Apprentice — don't assume

${table(group(vocab, i => !i.solid))}

## Solid kanji — safe to write without furigana

${kanji.filter(i => i.solid).map(i => i.characters).join(" ") || "_none_"}

## Kanji still in Apprentice

${kanji.filter(i => !i.solid).map(i => i.characters).join(" ") || "_none_"}
`);

  console.log(
    `Level ${user.data.level} · ${items.length} unlocked · ${solid.length} solid ` +
    `(${vocab.length} vocab, ${kanji.length} kanji)\n` +
    `→ me/wanikani.json\n→ me/vocabulary.md`
  );
}

main().catch(e => { console.error(e.message); process.exit(1); });
