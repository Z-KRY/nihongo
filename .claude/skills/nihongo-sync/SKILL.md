---
name: nihongo-sync
description: Pull WaniKani progress into the nihongo repo so sessions know what vocabulary and kanji the learner actually knows. Use when the user says "sync wanikani", "nihongo sync", "pull my wanikani", "update my vocabulary", "refresh my level", or when a session needs current vocabulary and me/vocabulary.md is stale or missing.
---

# Sync

Pulls WaniKani into `me/wanikani.json` and `me/vocabulary.md`.

```bash
node scripts/wanikani-pull.mjs
```

Add `--refresh-subjects` to re-pull the subject catalogue — only needed if WaniKani has added content, which is rare. The cache is static and pulling it takes a while.

## Why this exists

Tutoring quality was capped by not knowing the learner's vocabulary. The level was mis-set **twice** in the first session — once too high, once too low — because it was being inferred from a handful of sentences. WaniKani's assignment data is ground truth: every unlocked item with its SRS stage.

## Read it before teaching

`me/vocabulary.md` is the file the tutoring skills consult. `/nihongo` and `/nihongo-ask` should read it whenever it exists, and prefer it over `me/progress.md`'s vocabulary section, which is a hand-maintained approximation of the same thing.

**Guru (stage 5) and above counts as known.** Apprentice does not — those items are still being actively drilled on WaniKani, will be recognised inconsistently, and testing them here duplicates work already happening elsewhere.

Two rules follow:

- **Never teach a Guru+ item as new vocabulary.** It wastes the session and reads as not paying attention.
- **Do use Guru+ items freely in example sentences.** That's the whole payoff — examples can be built from real known vocabulary instead of the fifteen words a session happened to introduce.

Same logic for kanji: Guru+ kanji can be written bare. Everything else follows the script preference in `me/profile.md`.

## Scope, honestly

**Read-only, permanently.** WaniKani's subject content is fixed and curated — the API can write `study_materials` (your own notes and synonyms), start an assignment, and submit a review, but there is no endpoint to add your own vocabulary. Don't design around a write path that doesn't exist, and don't describe this as bidirectional.

Anki is the bidirectional leg. See `ARCHITECTURE.md` for how the pieces fit and which system owns spaced repetition.

## Token

`$WANIKANI_TOKEN`, or `~/.config/nihongo/wanikani.token`. Deliberately outside the repo so it can't be committed.

**Never ask the user to paste the token into chat** — that writes a credential into the transcript. Have them save it to the file and read the file. The script prints the exact commands if the token is missing.

## Staleness

`me/vocabulary.md` records its pull date. If it's more than a week or two old and the learner is actively using WaniKani, suggest a re-sync in one line — don't run it unprompted mid-session, and don't nag.
