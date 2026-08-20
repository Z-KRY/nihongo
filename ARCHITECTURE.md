# Architecture

How the pieces fit, and which system owns what. Written 2026-08-11.

```
   WaniKani  ──read──▶   this repo   ◀──read/write──▶   Anki
   (curriculum)          (teaching)                    (scheduling)
```

Three tools, three jobs, no overlap. The overlap is what causes trouble.

## Who owns what

| | Owns | Doesn't |
|---|---|---|
| **WaniKani** | Its own kanji/vocab curriculum and SRS | Anything you add. Content is fixed |
| **This repo** | Teaching: correction, register, grammar, weak-point tracking | Scheduling |
| **Anki** | Spaced repetition for everything taught here | Knowing what you got wrong and why |

## WaniKani — read-only, permanently

Not a design choice. WaniKani's API can write `study_materials` (your own notes and synonyms), start an assignment, and submit a review — but **subject content is fixed and curated**. There is no endpoint to add your own vocabulary. Anything describing this leg as bidirectional is wrong.

The read is the valuable half anyway. `/nihongo-sync` pulls every unlocked item with its SRS stage, which is ground truth about vocabulary. The tutoring skills read `me/vocabulary.md` and follow two rules:

- **Guru (stage 5) and above = known.** Never re-taught, freely used in examples.
- **Apprentice = not known.** Still being drilled on WaniKani; testing it here duplicates that work.

This exists because the learner's level was mis-set twice in the first session — once too high, once too low — from inferring vocabulary out of a few sentences. Guessing was the bottleneck on tutoring quality.

## Anki — the bidirectional leg

Via AnkiConnect, an add-on exposing `localhost:8765`. Requires Anki desktop running.

- **Read:** existing decks, so cards you already have aren't duplicated.
- **Write:** new cards from sessions and from `/nihongo-ask`.

⚠️ AnkiConnect binds a local HTTP server. On a managed Mac that's the same shape of thing that has tripped endpoint security here before — worth clearing with IT rather than discovering.

## Spaced repetition lives in exactly one place

**Decision: Anki owns scheduling for everything taught here.** Three schedulers disagreeing about when you should see a word is worse than one, and Anki's is the one with a real algorithm and a phone app.

Consequences at cutover:

- `me/srs/deck.md` loses its `interval` / `due` columns and becomes a **staging area** — taught, not yet exported.
- Sessions end by pushing new cards to Anki instead of adjusting intervals by hand.
- `/nihongo-drill` and its artifact are **retired**. Anki does flashcards better; the only reason the drill existed was that the deck maintained itself, and once cards flow to Anki that advantage moves with them.

### Not yet executed

The decision is recorded; the cutover is pending Anki being installed. Stripping intervals now would leave no scheduler at all, and retiring the drill now would leave nothing to drill on. **Order matters: wire Anki, verify a round-trip, then demote the deck and retire the drill.** Not before.

Until then `me/srs/deck.md` keeps its intervals and stays authoritative, and the drill artifact stays live.

## What ships when someone clones this

Everything except state. `me/` (profile, progress, deck, journal, WaniKani pull) and `buddies/` are gitignored, so a clone starts clean and `/nihongo-setup` builds it.

Credentials live outside the repo entirely — `~/.config/nihongo/wanikani.token`, never a repo file, never pasted into chat.

## Commands

| | |
|---|---|
| `/nihongo-setup` | First run. Interview → `me/` |
| `/nihongo` | A session: review, teach, drill, write state |
| `/nihongo-ask` | One quick question → answer + a card |
| `/nihongo-sync` | Pull WaniKani progress |
| `/nihongo-drill` | Build the flashcard artifact *(retired at Anki cutover)* |
| `/nihongo-buddy` | Export/import a profile, generate paired activities |
