# Architecture

How the pieces fit, and which system owns what. Written 2026-08-11.

```
   WaniKani ──read──▶  this repo  ──▶ /nihongo      teach grammar
   (the spine)         (the hub)   ──▶ /nihongo-talk  use it under pressure
                                   ──▶ /nihongo-ask   answer, capture
```

## Why the split is clean rather than arbitrary

**WaniKani teaches no grammar whatsoever.** That's their design, not a flaw — it's why people pair it with Genki or Bunpro. So the tutor's job is exactly the complement, and the two never overlap.

| Layer | Owns | Never does |
|---|---|---|
| **WaniKani** | Kanji + its vocabulary, on its own SRS | Grammar. Any of it |
| **This repo** | Grammar, correction, register, production, conversation | Re-teach a WaniKani item |
| **The hub** | The merged picture of what the learner knows | Scheduling WaniKani's content |

WaniKani is the spine and the tutor works around it: never teaching vocabulary WK is about to introduce, always free to use anything at Guru or above.

## Rejected: the "digital school" artifact

Considered and declined — a single artifact hosting WaniKani reviews plus lessons plus chat.

It would reimplement three things worse than they already exist. WaniKani's value *is* their scheduler and answer validation (typo tolerance, on'yomi/kun'yomi warnings, mnemonics) — rebuilding that interface means rebuilding all of it. The tutor's value is judgement on novel input, which needs a model in a loop, not a page. And an artifact runs on claude.ai and cannot write repo state.

Steelmanned: with runtime capabilities a page *could* host a Japanese chat. Declined anyway — it'd be a worse chat UI than the one the learner is already in, couldn't read the progress files, and would split tutoring across two places.

**The general principle: a portal adds a layer without adding capability.** Things feeling scattered is a connective-tissue problem, not a front-end one.

An artifact *dashboard* — read-only, showing the merged picture — is legitimate but low priority. `/nihongo-drill` is the only artifact so far.

## WaniKani — read-only, permanently

Not a design choice. WaniKani's API can write `study_materials` (your own notes and synonyms), start an assignment, and submit a review — but **subject content is fixed and curated**. There is no endpoint to add your own vocabulary. Anything describing this leg as bidirectional is wrong.

The read is the valuable half anyway. `/nihongo-sync` pulls every unlocked item with its SRS stage, which is ground truth about vocabulary. The tutoring skills read `me/vocabulary.md` and follow two rules:

- **Guru (stage 5) and above = known.** Never re-taught, freely used in examples.
- **Apprentice = not known.** Still being drilled on WaniKani; testing it here duplicates that work.

This exists because the learner's level was mis-set twice in the first session — once too high, once too low — from inferring vocabulary out of a few sentences. Guessing was the bottleneck on tutoring quality.

## Conversation — the piece nothing else provides

`/nihongo-talk` is a conversation partner **constrained to vocabulary the learner demonstrably knows**: WaniKani items at Guru or above, plus the deck's active rotation, plus grammar actually verified in `me/progress.md`.

That constraint is the whole value, and it's unavailable anywhere else. A generic AI chat uses whatever vocabulary it likes and the learner drowns. A real Japanese person can't calibrate to a specific 300 words either — nobody can hold that in their head. A skill can, because it's written down.

It also closes the loop. Drills test retrieval on demand; conversation tests it under pressure, and the two fail differently. Words wanted mid-conversation are the highest-signal vocabulary data available, and grammar that collapses live but held on paper is recorded as a distinct failure mode — only the live one predicts real conversation.

## Anki — deferred, not cancelled

**Revised 2026-08-11.** An earlier decision here made Anki the owner of spaced repetition. Integrating WaniKani removed most of Anki's job, so that's withdrawn.

WaniKani now schedules kanji and vocabulary. What's left for Anki is grammar patterns, frames, survival phrases and register facts — **about 40 cards.** Markdown handles 40 cards fine. Anki earns its install, its add-on, and the endpoint-security conversation at a few hundred, not forty.

**Trigger to revisit:** when reviewing the deck by hand becomes annoying. Until then `me/srs/deck.md` keeps its intervals and stays authoritative, and `/nihongo-drill` stays live.

When it does happen, order matters: wire Anki, verify a round-trip, *then* demote the deck to a staging area and retire the drill. Not before — doing it first leaves no scheduler and nothing to drill on.

⚠️ AnkiConnect binds a local HTTP server on `:8765`. On a managed Mac that's the same shape of thing that has tripped endpoint security here before — worth clearing with IT rather than discovering.

## What ships when someone clones this

Everything except state. `me/` (profile, progress, deck, journal, WaniKani pull) and `buddies/` are gitignored, so a clone starts clean and `/nihongo-setup` builds it.

Credentials live outside the repo entirely — `~/.config/nihongo/wanikani.token`, never a repo file, never pasted into chat.

## Commands

| | |
|---|---|
| `/nihongo-setup` | First run. Interview → `me/` |
| `/nihongo` | A session: review, teach, drill, write state |
| `/nihongo-talk` | Conversation, capped to vocabulary you actually know |
| `/nihongo-ask` | One quick question → answer + a card |
| `/nihongo-sync` | Pull WaniKani progress |
| `/nihongo-drill` | Build the flashcard artifact |
| `/nihongo-buddy` | Export/import a profile, generate paired activities |

## The loop

```
WaniKani  ─── vocabulary ──▶  /nihongo  ─── grammar ──▶  /nihongo-talk
    ▲                            ▲                            │
    │                            └──── gaps, collapses ────────┘
    └── keeps its own schedule                     /nihongo-ask ┘
```

Conversation is what generates the next session's material: words wanted and not had, patterns that held on paper and failed live. Without that leg the tutor is guessing what to teach next — which is the same failure that mis-set the level twice on day one.
