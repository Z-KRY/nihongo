---
name: nihongo-story
description: Write a short Japanese story built from the vocabulary and kanji the learner has actually unlocked in WaniKani, as graded reading practice. Use when the user says "nihongo story", "make me a story", "give me something to read", "reading practice", "write a story in Japanese", or asks for Japanese text at their level.
---

# Story

A graded reader built from this learner's own WaniKani progress.

## Inputs

- `me/vocabulary.md` — WaniKani items and SRS stages. **If missing or stale, run `scripts/wanikani-pull.mjs` first.** Without it there is nothing to grade against and the skill can't do its job.
- `reference/story-grammar.md` — the sentence patterns allowed. This is a hard ceiling, not a suggestion.
- `me/stories/` — what's already been written, so vocabulary gets recycled deliberately rather than by accident.

## The constraint that matters

**Aim for 98% known words.** That's the extensive-reading threshold: below about 95%, reading stops being reading and becomes decoding with a dictionary, and people quit. For a story of 60–100 words that means **at most one or two unfamiliar items**, and they should be inferable from context.

More known vocabulary than feels interesting to write with is the correct amount.

## Kanji

- **Guru or above (SRS stage ≥ 5): write bare.** This is the payoff — reading their own kanji in running text, which WaniKani itself never gives them.
- **Apprentice: write bare with furigana in brackets** — 学校[がっこう]. They're mid-drill on it; seeing it supported is reinforcement.
- **Not yet unlocked: kana only.** Never introduce a kanji WaniKani hasn't reached. It undercuts the curriculum and teaches the wrong reading order.

## Make it reinforce, not test

The story is not an exam. Build it mostly from **solid (Guru+)** vocabulary, then deliberately seed **two or three Apprentice items** — the ones WaniKani is drilling right now.

That's the whole value. WaniKani teaches words in isolation; meeting one in a sentence, doing a job, is what turns a flashcard answer into a word you know. Choose the seeds from items at Apprentice 3–4, which are closest to promotion and benefit most.

## Craft

- **Repetition is good pedagogy.** Using the same word four times in sixty words would be bad prose and is excellent graded reading. Do it on purpose.
- **Short sentences.** One idea each. Long sentences fail on grammar the reader doesn't have, not on vocabulary.
- **Give it a turn.** 田中さんは学校に行きます。田中さんは本を読みます。 is technically a story and nobody has ever wanted to read one. A small joke, a cat doing something unreasonable, a tiny twist at the end — at sixty words you can still land something. If the learner wouldn't mention it to anyone, write a different one.
- **Concrete over abstract.** Their vocabulary is nouns and everyday verbs. Lean into it.
- **Title it in Japanese**, within the same constraints.

## Order of presentation

Strict, and it matters:

1. **The story.** Nothing else. No glossary above it, no translation alongside.
2. **Glossary** — only the two or three items that are new or seeded, with readings.
3. **Translation** — last, and say plainly that it's there for checking *after* an attempt.

If the translation sits next to the story they will read the translation. This isn't a trust problem, it's how eyes work.

## Save it

Write to `me/stories/YYYY-MM-DD-<short-slug>.md` with the same structure. Note at the bottom which Apprentice items were seeded and what the approximate known-word percentage was.

**Re-reading old stories is worth more than reading new ones**, because fluency comes from meeting known words at speed, not from meeting new ones. Say so once, when there are three or four in the folder — not every time.

## Response format

Post the story in chat as well as saving it. No preamble about what you're about to do, no summary afterwards. The story, the glossary, the translation, done.
