---
name: nihongo
description: Run one Japanese study session — reviews due SRS items, teaches at the learner's rung, drills, and writes state back. Use when the user says "nihongo", "let's study Japanese", "start a session", "review my Japanese", "日本語の練習", or asks to be quizzed, drilled, or corrected on Japanese.
---

# Study session

## Before starting

Read, in order:

1. `../../../CLAUDE.md` (repo root) — tutoring rules and the production ladder
2. `me/profile.md` — rung, goal, script, cadence, instruction language
3. `me/progress.md` — grammar covered, weak-point ranking
4. `me/srs/deck.md` — what's due

**If `me/profile.md` doesn't exist, stop and run `/nihongo-setup` instead.** Don't guess at a level.

Write all explanations in the instruction language named in the profile.

## Phase 1 — Review (~⅓ of the session)

Decrement every `due` in `me/srs/deck.md` by 1. Quiz everything at 0 or below.

One item at a time. **Wait for the answer before revealing** — batching all the questions up front lets them pattern-match across the set and reveals nothing about recall.

Direction: both ways at rung 1, production-only at rungs 2–3.

After each: correct → `interval` doubles, `due` = new interval. Wrong → both reset to 1. Write the deck back at the end of the phase.

Cap at 8 items. If more are due, take the shortest intervals and leave the rest — a review backlog must never eat the teaching half of the session.

## Phase 2 — Teach and drill (~⅔ of the session)

**Pick the shape from the rung. Do not run a higher rung's activity because it looks more impressive.**

### Rung 1

- **New vocabulary:** 5–8 words, themed so they combine. Always presented inside a frame the learner already has, never as a bare list.
- **Substitution drill:** one frame, rapid swaps, mixing today's words with older ones. Keep the prose between items to almost nothing — the reps are the lesson.
- **Read-aloud for meaning:** one short line of known vocabulary. They read it, then say what it meant. Their decoding is already fine; you're building the second step only.

### Rung 2

- **Guided production:** you give the frame, they fill it. Question-and-answer pairs taught as single units.
- **Targeted drill** on the top unresolved weak point in `me/progress.md`.

### Rung 3

- **Free production:** one situational prompt, 2–4 sentences unaided. Situations they'd actually meet, not grammar exercises. Good: "you run into a coworker at a café and they ask about your weekend." Bad: "make three sentences using を."
- **Full correction protocol**, ranked by severity.
- **Targeted drill** on whatever phase 2 exposed.

## Phase 3 — Close

Do the bookkeeping **silently**. Read the Response format section of `CLAUDE.md` first if you haven't.

- Add every new word and every mistake to `me/srs/deck.md` at `interval: 1, due: 1`.
- Update `me/progress.md`: promote recurring weak points (noting how many sessions), move resolved ones to Resolved, rewrite "Next session focus".
- Append to `me/journal/YYYY-MM-DD.md`: what was taught, the learner's **raw unedited attempts**, your corrections, and any post-mortem on your own tutoring errors. The raw text is the point — it's the only record of what they actually produce.
- Check `me/questions.md`. Anything asked three or more times is a real gap; fold it into "Next session focus".

Then say **one line** to the learner: what to work on next. That's the entire close.

Not allowed in the closing message: a summary of the session, a list of files you touched, a recap of their score, or commentary on your own performance. All of that goes in the journal.

## Advancing

**Lesson:** when they finish a textbook lesson, update the position in `me/progress.md` and add that lesson's grammar. Mark it unverified until they've used it correctly unaided.

**Rung:** promote only when the evidence is there — rung 1 → 2 when they reliably get meaning from known-vocabulary sentences; 2 → 3 when they produce correct sentences without a supplied frame. Promoting early is the most likely way this repo stops being used, because every session afterwards feels like failure. If in doubt, stay.

Note any rung change in `me/profile.md` **and** `me/progress.md`.
