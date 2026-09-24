# nihongo

Two tools around a WaniKani habit, run with [Claude Code](https://claude.com/claude-code).

1. **Review reminders** — a background agent checks WaniKani and pops a macOS notification when reviews are worth doing.
2. **Graded stories** — short Japanese built from the vocabulary and kanji you've actually unlocked, so you can read something real instead of drilling flashcards forever.

WaniKani is the curriculum. These don't compete with it.

## Setup

**1. Get a WaniKani token** — [wanikani.com/settings/personal_access_tokens](https://www.wanikani.com/settings/personal_access_tokens). Read-only scope is enough.

```bash
mkdir -p ~/.config/nihongo && chmod 700 ~/.config/nihongo
printf '%s' 'YOUR_TOKEN' > ~/.config/nihongo/wanikani.token
chmod 600 ~/.config/nihongo/wanikani.token
```

Kept outside the repo so it can't be committed.

**2. Check notifications actually work** before trusting a schedule to them:

```bash
node scripts/wk-review-check.mjs --test
```

If nothing appears, allow notifications for **Script Editor** in System Settings → Notifications. macOS attributes `osascript` notifications to it.

**3. Install the agent:**

```bash
./scripts/install-agent.sh
```

Checks every 15 minutes. Pass seconds to change it (`./scripts/install-agent.sh 1800`), or `--uninstall` to remove.

**4. Pull your progress:**

```bash
node scripts/wanikani-pull.mjs
```

Writes `me/vocabulary.md` — what you know and how solidly. Re-run it every week or two.

## Daily use

| | |
|---|---|
| Notifications | Automatic, once the agent's installed |
| `/nihongo-story` | A story to read, built from your own vocabulary |
| `/nihongo-sync` | Re-pull WaniKani progress |
| `node scripts/wk-review-check.mjs --status` | What's waiting, and whether it would notify |

## How the reminders avoid being annoying

A reminder you learn to ignore is worse than none. Defaults:

- **Nothing below 5 reviews.** WaniKani drips them in; being pinged for three teaches you to dismiss pings.
- **One ping per backlog**, then quiet for 3 hours — unless 10+ more pile up, which earns an early nudge.
- **Silent 22:00–07:00.**
- **Clearing your reviews resets it**, so the next batch pings fresh instead of being swallowed by a cooldown.

Override any of it in `~/.config/nihongo/config.json`:

```json
{ "threshold": 5, "growth": 10, "cooldownHours": 3, "quietFrom": 22, "quietTo": 7 }
```

## How the stories stay readable

**Around 98% of the words are ones you already know.** That's the extensive-reading threshold — below roughly 95%, reading turns into decoding with a dictionary and people quit. So a story carries at most one or two unfamiliar items, inferable from context.

Kanji follows WaniKani exactly: **Guru or above written bare**, Apprentice with furigana, anything not yet unlocked in kana. You never meet a kanji ahead of the curriculum.

Each story deliberately seeds two or three items currently at Apprentice. WaniKani teaches words in isolation; meeting one in a sentence, doing a job, is what turns a flashcard answer into a word you know.

Grammar is capped by [reference/story-grammar.md](reference/story-grammar.md) — **edit that file as you learn.** It exists because WaniKani teaches no grammar at all, so without a floor you'd know every word in a sentence and still not be able to read it.

## Layout

```
scripts/wk-review-check.mjs   the scheduled check + notification
scripts/install-agent.sh      launchd agent install/uninstall
scripts/wanikani-pull.mjs     pulls progress → me/vocabulary.md
reference/story-grammar.md    grammar ceiling for stories — edit as you learn
me/                           your state. gitignored
```

Troubleshooting the agent:

```bash
launchctl print gui/$UID/com.nihongo.wanikani-reviews | head -20
cat ~/.config/nihongo/agent.err.log
```
