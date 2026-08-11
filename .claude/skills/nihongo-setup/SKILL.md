---
name: nihongo-setup
description: First-run setup for the nihongo study repo — interviews the learner about level, goal, script preference and cadence, then writes me/profile.md, me/progress.md and me/srs/deck.md from templates. Use on a fresh clone, when me/profile.md is missing or still has placeholders, or when the user says "set up nihongo", "onboard me", "start my Japanese project", or wants to reconfigure their level or goal.
---

# Setup

Creates `me/` for a new learner. Run once per clone.

If `me/profile.md` already exists and has no placeholders, don't silently overwrite it — say it's already set up and offer to change specific fields instead.

## Interview

Ask these in **at most two batched rounds** — use `AskUserQuestion` with several questions at once rather than a slow back-and-forth. Setup should take about five minutes, not twenty.

**Round 1 — the essentials**

1. **Rung.** Don't ask "what's your level" — the answers aren't comparable between people. Ask what they can actually do:
   - Can you read hiragana and katakana without stopping to work them out?
   - When you read a sentence aloud, do you usually know what it meant?
   - Could you answer 「しゅうまつ、なにを しましたか」out loud, unaided?

   Map: kana yes + meaning no → **rung 1**. Meaning mostly yes, unaided answer no → **rung 2**. Unaided answer yes → **rung 3**.

   **Round down when it's close.** A rung too low costs one slightly dull session. A rung too high produces a session the learner can't do, which reads to them as personal failure rather than mis-set config.

2. **Goal.** Conversation / JLPT / reading / living in Japan. Push for one primary — "all of them" produces an unfocused syllabus. If they pick several, ask which they'd keep if they could only have one.

3. **Cadence.** Session length and frequency. Short and frequent beats long and rare for retention; recommend ~20 min most days but don't argue if they want otherwise.

**Round 2 — calibration**

4. **Textbook.** Which one and where they are. If none, say so — the repo works without one, it just means Claude sets the sequence.
5. **Script.** Kanji preference, furigana. Default to hiragana-first with furigana for rung 1.
6. **Instruction language.** What language explanations should be in. Default to the language they've been talking to you in. **This matters more than it sounds** — a rung-1 learner given Japanese explanations gets nothing out of the session.
7. **Assets.** Anything already strong — pronunciation, kana speed, listening from anime, a related language. These are what sessions should exploit.

## Then

1. Copy `templates/profile.md` → `me/profile.md` and fill every field. No placeholders left behind.
2. Copy `templates/progress.md` → `me/progress.md`. Fill in grammar covered from their textbook position. If they named a lesson, list that lesson's grammar points — but mark anything they haven't confirmed they can *use* as unverified rather than covered.
3. Copy `templates/deck.md` → `me/srs/deck.md` and seed **10–15 cards**, all at `interval: 1, due: 1`:
   - At rung 1, weight toward high-frequency vocabulary and 3–4 survival phrases from `reference/crutch-phrases.md`.
   - At rungs 2–3, weight toward patterns and their known weak points.
4. Create `me/journal/` (empty is fine).
5. Tell them: run `/nihongo` to start, and `/nihongo-buddy export` if they have someone to study with.

## Don't

- Don't seed the deck with words the learner already knows cold — it burns review time and teaches them the deck is boring.
- Don't fill the profile with hedges. "Maybe rung 1 or 2" is useless to the session skill. Pick one and write it down; it's cheap to change later.
- Don't skip the assets question. It's the only part of the interview that finds things to build *on* rather than things to fix.
