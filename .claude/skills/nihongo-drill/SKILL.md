---
name: nihongo-drill
description: Build or refresh a personal flashcard drill artifact from the learner's own deck — a phone-friendly tap-to-reveal practice page with mora counts and register warnings. Use when the user says "nihongo drill", "make me a flashcard app", "build the drill page", "refresh my drill", "I want to practise on my phone", or asks for a UI for their vocabulary.
---

# Drill artifact

Generates `me/drill.html` from `me/srs/deck.md` and publishes it as an Artifact.

**What this is and isn't.** A *practice tool*, not the system of record. The SRS schedule lives in `me/srs/deck.md` and is updated only by `/nihongo`. The artifact runs on claude.ai and cannot write back to the repo, so it must never present itself as tracking the schedule — that would give the learner two disagreeing sources of truth. Drilling here is free and unlimited; it changes no intervals.

Say this plainly to the learner once. The page also states it in its own subheading.

## Build

1. Read `me/profile.md` for script preference and instruction language, and `me/srs/deck.md` for the cards.
2. **Active rotation only.** Never include the backlog — those are cards the learner has never been taught, and drilling them is a cold test that teaches nothing.
3. Mirror the deck's own section headings as the page's sections. The learner already knows those groupings; inventing new ones makes the page feel unrelated to their deck.
4. Carry the deck's `Note` column across. **This is the most valuable content on the page** — it's where the register warnings and false-friend traps live (きみ is intimate/downward; みず is cold water only; パン is from Portuguese). A card without its note is just a dictionary entry.
5. Mark register/politeness hazards distinctly from ordinary notes — they're the ones with social consequences, not just accuracy ones.
6. Compute **mora counts** for single vocabulary words and show them as beat dots. Small っ and long ー each take one beat: がっこう is 4, コーヒー is 4. Skip them on full sentences, where the count stops being informative.

Load the `artifact-design` skill before writing the file, then publish with the `Artifact` tool.

## Refresh

Republish **the same file path** so the URL is stable — the learner will have bookmarked it on their phone. Never publish to a new path for an updated deck.

Worth refreshing after any session that added a batch of vocabulary.

## Design constraints

This is a daily tool on a phone, not a showpiece. Calm and fast beats impressive.

- Phone-first single column; tap the card to reveal.
- Japanese needs a font with real kana and kanji coverage — a Latin-only face falls back silently and the page looks broken. `Zen Kaku Gothic New` is on Google Fonts and works.
- Big Japanese, quiet everything else.
- Both directions (EN→JA and JA→EN) and per-section filtering.
- Keyboard support for desktop; large tap targets for phone.
- End the run with the missed cards listed, framed as *bring these back to `/nihongo`* — that's the only handoff path back to the real schedule.

## Sharing

The published artifact contains **this learner's vocabulary**, so its URL is useless to anyone else — don't offer it as something to share with a study buddy.

What's shareable is this skill. Anyone who clones the repo runs it against their own `me/srs/deck.md` and gets their own artifact. If the learner wants to give a buddy a drill page, the answer is "clone the repo and run `/nihongo-drill`", not a link.
