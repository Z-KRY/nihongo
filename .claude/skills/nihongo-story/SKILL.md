---
name: nihongo-story
description: Write a short Japanese story from the vocabulary and kanji the learner has unlocked in WaniKani, add it to their reader artifact, and adapt it to what they struggled with last time. Use when the user says "nihongo story", "make me a story", "give me something to read", "reading practice", or asks for Japanese text at their level.
---

# Story

Graded readers built from this learner's own WaniKani progress, published into a reader artifact that collects what they struggled with.

## The reader artifact

**Never hardcode an artifact URL in this file** — it ships to everyone who clones the repo, and an artifact is private to one account.

- `me/reader.html` is this learner's copy of the page. Republish **that same path** every time; the URL is stable and they will have bookmarked it.
- `me/reader-url.txt` holds their artifact URL. Read it to know where to publish and which database to query.
- **Neither exists on a fresh clone.** Copy `templates/reader.html` → `me/reader.html`, publish it (no `url`), and write the returned URL to `me/reader-url.txt`. Do that once, silently, as part of writing their first story.

## First, read what went wrong last time

Before writing anything, read the artifact's database with `ArtifactData`:

- `marks` — every word or line they flagged. `type: "word"` is a **vocabulary** gap; `type: "grammar"` is a **grammar** gap. They need opposite fixes, which is the entire reason the page distinguishes them.
- `quiz` — comprehension results. A wrong answer on a question whose sentence carries no marks is the interesting case: they *thought* they understood.

Act on it:

| Signal | Response |
|---|---|
| Same word marked across stories | Reuse it deliberately in the next one. Repetition, not avoidance |
| Many word marks, few line marks | Vocabulary is too far ahead. Pull it back toward Guru+ only |
| Many line marks, few word marks | **Grammar floor is too high.** Lower `reference/story-grammar.md` |
| Clean marks but quiz wrong | Comprehension is the gap, not decoding. Shorter sentences, clearer narrative |
| Clean marks and quiz right | Raise difficulty — more Apprentice seeds, or one pattern up |

Say in one line what the data changed. If there are no marks yet, say that instead of inventing a rationale.

## Then write it

Inputs: `me/vocabulary.md` (run `scripts/wanikani-pull.mjs` if missing or stale) and `reference/story-grammar.md` (a hard ceiling, not a suggestion).

**Aim for 98% known words.** The extensive-reading threshold — below about 95% reading becomes decoding with a dictionary and people quit. In 60–100 words that's **one or two** unfamiliar items, inferable from context.

**Kanji follows WaniKani exactly:**
- Guru+ (stage ≥ 5) — bare. This is the payoff: their own kanji in running text.
- Apprentice — bare, but the token's gloss carries the reading.
- Not unlocked — kana only. Never run ahead of the curriculum.

**Seed two or three Apprentice items** (stages 3–4, closest to promotion). WaniKani teaches words in isolation; meeting one doing a job in a sentence is what promotes it from flashcard answer to known word.

**Craft:** repetition is good pedagogy, not weak prose — reuse words on purpose. Short sentences; long ones fail on grammar, not vocabulary. And give it a turn — a joke, a cat behaving unreasonably, a twist. If they wouldn't mention it to anyone, write a different one.

## Add it to the reader

Prepend a new object to the `STORIES` array in `me/reader.html` (newest first) and republish that path.

Each entry needs:

```js
{
  id: "YYYY-MM-DD-slug",        // stable — db rows key off it
  title: "…", date: "…", note: "…",
  lines: [ [ {t:"word", r:"reading", m:"meaning"}, {t:"は", m:"particle — topic"}, {p:"。"} ], … ],
  quiz: [ { ask:"…", opts:[…], a:0 } ],   // a = index of the correct option
  translation: "…"
}
```

- **Tokenise by meaningful unit**, matching how WaniKani teaches it — `ベッドの下` is one item, not three.
- **Every token needs `m`**, particles included. A particle gloss is often exactly what an unparseable line needs.
- `{p:"。"}` for punctuation — non-interactive.
- **Quiz tests comprehension, not vocabulary.** Ask about what happened, in English, 3–4 multiple choice. Correct answer at index `a`; the page shuffles display order.

Also save a plain copy to `me/stories/YYYY-MM-DD-slug.md` — readable without opening the artifact, and a record if the page is ever rebuilt.

## Response format

Post the story in chat as well, then the link. No preamble, no summary. Don't paste the translation into chat — the page keeps it behind a disclosure for a reason, and putting it in the transcript defeats that.
