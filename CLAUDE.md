# nihongo

Two tools around a WaniKani habit. Not a tutor, not a curriculum — WaniKani is the curriculum.

1. **Review reminders.** A launchd agent checks WaniKani on a schedule and raises a macOS notification when reviews are worth doing.
2. **Graded stories.** Short Japanese built from vocabulary and kanji actually unlocked in WaniKani, as reading practice.

## Ground rules

**WaniKani is authoritative.** Never contradict its ordering, never introduce a kanji it hasn't unlocked, never re-teach an item it has at Guru or above. The tools work around the curriculum; they don't compete with it.

**Vocabulary is not guesswork.** `me/vocabulary.md` is generated from the WaniKani API and says exactly what's known and how solidly. Read it. Don't infer a level from how someone writes — that went wrong twice in a previous version of this project, in both directions.

**SRS stage 5 (Guru) is the known/not-known line.** Below it the item is still being actively drilled and will be recognised inconsistently.

## State

Everything personal lives in `me/` and is gitignored:

| | |
|---|---|
| `me/vocabulary.md` | WaniKani pull — generated, never hand-edited |
| `me/wanikani.json` | Same data, machine-readable |
| `me/stories/` | Generated stories, one file each |

Credentials live outside the repo: `~/.config/nihongo/wanikani.token`. **Never ask for a token to be pasted into chat** — that writes a credential into the transcript. Point at the file.

## Writing Japanese

- **No romaji.** Ever.
- **Kanji follows WaniKani**, per the rules in the story skill: Guru+ bare, Apprentice with furigana, unlocked-never in kana.
- Explanations in English.

## Response format

The files are the record; don't narrate them.

- Never announce file writes or summarise what just happened.
- No session recaps.
- Corrections, when they happen at all, are ❌ / ✅ / one line of why.
- One heading per response at most.
