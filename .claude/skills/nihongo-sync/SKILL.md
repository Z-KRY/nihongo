---
name: nihongo-sync
description: Pull WaniKani progress so stories know which vocabulary and kanji are actually unlocked. Use when the user says "sync wanikani", "nihongo sync", "pull my wanikani", "update my vocabulary", "refresh my progress", or when me/vocabulary.md is missing or stale before writing a story.
---

# Sync

```bash
node scripts/wanikani-pull.mjs
```

Writes `me/vocabulary.md` (human-readable, what the story skill reads) and `me/wanikani.json` (the same data, machine-readable).

Add `--refresh-subjects` only if WaniKani has added content — the subject catalogue is static, cached after the first pull, and slow to fetch.

## Reading the output

**SRS stage 5 (Guru) is the known/not-known line.**

- **Guru and above** — solid. Usable bare in stories, kanji included.
- **Apprentice (1–4)** — still being drilled on WaniKani, recognised inconsistently. Usable in a story *with support* (furigana on kanji), and deliberately worth seeding, but never assumed.
- **Not unlocked** — off limits. Never introduce a kanji ahead of the curriculum.

## Scope

**Read-only, permanently.** WaniKani's subject content is fixed and curated. The API can write `study_materials` (your own notes and synonyms), start an assignment, and submit a review — but there is no endpoint to add your own vocabulary. Don't design around a write path that doesn't exist.

## Token

`$WANIKANI_TOKEN`, or `~/.config/nihongo/wanikani.token`. Deliberately outside the repo.

**Never ask for the token to be pasted into chat** — that writes a credential into the transcript. The script prints the exact setup commands when it's missing.

## Staleness

`me/vocabulary.md` records its pull date. Worth re-running weekly while WaniKani is active — items move to Guru between pulls and that quietly widens what stories can use. Suggest it in one line if it's a couple of weeks old; don't nag.
