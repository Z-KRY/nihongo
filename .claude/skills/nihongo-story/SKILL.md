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

- `marks` — every reveal, at one of three `level`s. They mean different things and need opposite fixes:
  - **`reading`** — couldn't read the kanji but knew the word. A **kanji** gap.
  - **`meaning`** — read it fine, didn't know the word. A **vocabulary** gap. This is the one that counts against coverage.
  - **`grammar`** — knew every word, the line still wouldn't parse. A **grammar** gap.
- `quiz` — comprehension results. A wrong answer on a line carrying no marks is the interesting case: they *thought* they understood.

**Coverage is the headline number**: `1 − (meaning reveals ÷ content tokens)`. The page shows it live. Below 95% reading has become decoding, which is the level at which people stop reading — and it's the same threshold the story generation targets, so the loop closes.

Act on it:

| Signal | Response |
|---|---|
| **Coverage below 95%** | Too hard. Pull vocabulary back toward Guru+ only and drop the Apprentice seeds to one |
| Many `reading` marks, few `meaning` | They know the words, not the kanji. Keep the vocabulary, but write more of it in kana |
| Many `meaning` marks | Vocabulary is genuinely ahead of them. Easier words, more repetition |
| Many `grammar` marks, high coverage | **The floor is too high, not them.** Lower `reference/story-grammar.md` |
| Same word marked across stories | Reuse it deliberately in the next one. Repetition, not avoidance |
| Clean marks but quiz wrong | Comprehension is the gap, not decoding. Shorter sentences, clearer narrative |
| Coverage 100% and quiz clean | Raise difficulty — more Apprentice seeds, or one grammar pattern up |

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

Stories live in the artifact's **database**, not in the page HTML. Write one document to the `stories` collection with `ArtifactData`:

```json
{ "id": "YYYY-MM-DD-slug", "title": "…", "date": "YYYY-MM-DD",
  "createdAt": "<ISO>", "note": "one short English line",
  "lines": [[{"t":"word","r":"reading","m":"meaning"},{"t":"は","m":"particle — topic"},{"p":"。"}]],
  "quiz": [{"ask":"…","opts":["…"],"a":0}],
  "translation": "…", "status": "active", "source": "claude-code" }
```

Build it in a local JSON file and pass `file_path` — the tokenised lines are long and don't belong inline.

- **Tokenise by meaningful unit**, matching how WaniKani teaches it — `ベッドの下` is one item, not three.
- **Every token needs `m`**, particles included. A particle gloss is often exactly what an unparseable line needs.
- `r` only where the token contains kanji. `{"p":"。"}` for punctuation.
- **Quiz tests comprehension, not vocabulary** — what happened, in English, 3–4 options, `a` is the correct index. The page shuffles display order.

Nothing needs republishing to add a story. Only rebuild and republish the page when the **vocabulary** changes:

```bash
node scripts/wanikani-pull.mjs && node scripts/build-reader.mjs
```

then publish `me/reader.html` to the URL in `me/reader-url.txt`. That's what injects the current Guru+ vocabulary and grammar floor into the page, which the page needs because it generates stories too.

Also save a plain copy to `me/stories/YYYY-MM-DD-slug.md` — readable without opening the artifact.

## The page writes its own stories

The reader has `sample`, so **Finish & write a new one** generates without a Claude Code session. Those arrive with `source: "in-page"`.

They're constrained by the same vocabulary and grammar floor, but they get no adaptation — the page can't read the marks and reason about them, lower the grammar floor, or notice that three stories running have the same weakness. Treat in-page stories as keeping the habit alive between sessions, and this skill as the one that actually moves the level.

When reviewing marks, check `source`. A run of in-page stories with rising mark counts usually means the floor needs lowering and nothing has been there to do it.

## Response format

Post the story in chat as well, then the link. No preamble, no summary. Don't paste the translation into chat — the page keeps it behind a disclosure for a reason, and putting it in the transcript defeats that.
