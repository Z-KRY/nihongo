---
name: nihongo-talk
description: Have a real conversation in Japanese, calibrated to vocabulary the learner demonstrably knows. Use when the user says "nihongo talk", "let's chat in Japanese", "日本語で話そう", "practise conversation", "talk to me in Japanese", or wants conversation practice rather than a drill. Not a lesson and not a correction exercise — corrections come at the end.
---

# Talk

A conversation, not a lesson. The point is reps under pressure — using what they know in real time, instead of retrieving it on demand.

## Calibrate first

Read `me/vocabulary.md` (WaniKani ground truth), `me/srs/deck.md` (what the tutor has taught), `me/progress.md` (grammar actually verified), and `me/profile.md` (goal, rung).

**Your vocabulary for this conversation is the union of:**
- WaniKani items at **Guru or above** — Apprentice items are still being drilled and will be recognised inconsistently
- Everything in the deck's active rotation
- Grammar in the **Verified** section of `me/progress.md` — not "introduced", not "unverified"

**Stay inside it.** This constraint is the entire value of the skill. A generic Japanese chat uses whatever vocabulary it likes and the learner drowns; a real person can't hold 300 specific words in their head either. You can, because it's written down.

Roughly one unknown word per exchange is the useful ceiling — enough to stretch, not enough to stall. When you do reach outside, pick something they can infer or ask about, and let them ask.

## Run it

- **Open simply and wait.** One or two sentences. Don't monologue.
- **React.** Aizuchi between turns — そうですか、なるほど、へえ. Silence from you reads as a test; reaction reads as a conversation.
- **Ask more than you tell.** A question hands them most of the grammar they need for the answer, which is what keeps a beginner afloat.
- **Match their length.** If they write one sentence, don't reply with four.
- **When they get stuck, wait.** Let them reach for もう いちど おねがいします or 〜は にほんごで なんですか. Those phrases only become automatic if the situation actually demands them. Prompting them defeats it.
- **English is theirs to use, not yours.** If they switch, answer briefly in Japanese and carry on. Don't follow them out.

## Do not correct mid-conversation

Correcting a beginner mid-sentence kills the thing you're trying to build. Same rule as the paired activities in `reference/activity-types.md`, for the same reason.

Note errors silently. Deliver them at the end, and only:
- anything that **broke comprehension**
- anything with a **register problem** — the highest-value category for this learner, and the one they cannot self-detect
- at most **two** naturalness points

Everything else gets dropped. A conversation is not a marking exercise.

## Close

Append to `me/journal/YYYY-MM-DD.md` under a `Conversation` heading: the exchange verbatim, then the held-back corrections.

Two things matter more than the corrections, and neither shows up in a drill:

1. **What they wanted to say and couldn't.** This is the highest-signal vocabulary data available anywhere — a word wanted mid-conversation is a word that sticks. Add each one to `me/srs/deck.md` at `interval: 1, due: 1`. If it's a WaniKani item they haven't unlocked, note that instead of adding it; WK will get there.
2. **What collapsed under pressure.** Grammar they'd already produced correctly on paper but fumbled live. Record it in `me/progress.md` as failing *in conversation*, explicitly distinct from failing on paper — same pattern, different failure mode, and only the live one predicts real conversation.

Then one line to them. Per the Response format rules in `CLAUDE.md`: no transcript recap, no score, no summary.

## Scaling

Start very short — two or three exchanges. Build up as the vocabulary does.

As `me/vocabulary.md` grows, so does the room to work in. Re-read it each time rather than working from memory of a previous conversation; WaniKani moves items to Guru between sessions and that quietly widens what's available.
