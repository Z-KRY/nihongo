# nihongo

Two tools around a WaniKani habit, run with [Claude Code](https://claude.com/claude-code).

1. **Review reminders** — a background agent checks WaniKani and pops a macOS notification when reviews are worth doing.
2. **Graded stories** — short Japanese built from the vocabulary and kanji you've actually unlocked, so you can read something real instead of drilling flashcards forever.

WaniKani is the curriculum. These don't compete with it.

## Setup

```bash
git clone https://github.com/Z-KRY/nihongo.git && cd nihongo && claude
```

Then `/nihongo-setup` — it walks the five steps below and does the ones it can.

Three of them need you, not Claude: creating the token, confirming a
notification actually appeared on screen, and telling it your WaniKani daily
lesson limit (the API doesn't expose that one).

**Requirements:** macOS, Node, and a WaniKani subscription.

<details>
<summary>Doing it by hand instead</summary>

**1. Token** — [wanikani.com/settings/personal_access_tokens](https://www.wanikani.com/settings/personal_access_tokens), read-only scope.

```bash
mkdir -p ~/.config/nihongo && chmod 700 ~/.config/nihongo
read -rs WK_TOKEN && printf '%s' "$WK_TOKEN" > ~/.config/nihongo/wanikani.token && chmod 600 ~/.config/nihongo/wanikani.token && unset WK_TOKEN
```

Paste at the blank line — nothing echoes, which is correct — then Enter.

`read -rs` rather than a placeholder you edit in: a placeholder invites being
run verbatim, which silently writes a dead token, and it puts the real one in
your shell history when it doesn't. This way the token never appears on screen,
in history, or in a chat transcript. It's kept outside the repo so it can't be
committed.

**2. Check notifications work** before trusting a schedule to them:

```bash
node scripts/wk-review-check.mjs --test
```

If nothing appears, allow notifications for **Script Editor** in System Settings → Notifications. macOS attributes `osascript` notifications to it, and the failure is otherwise silent.

**3. Install the agent:**

```bash
./scripts/install-agent.sh
```

Every 15 minutes. Pass seconds to change it (`./scripts/install-agent.sh 1800`), or `--uninstall`.

**4. Pull your progress:**

```bash
node scripts/wanikani-pull.mjs
```

Writes `me/vocabulary.md`. Re-run weekly.

</details>

## Daily use

| | |
|---|---|
| Notifications | Automatic, once the agent's installed |
| `/nihongo-story` | A story to read, built from your own vocabulary |
| `/nihongo-sync` | Re-pull WaniKani progress |
| `node scripts/wk-review-check.mjs --status` | What's waiting, and whether it would notify |

## How the reminders avoid being annoying

A reminder you learn to ignore is worse than none. Defaults:

- **Every batch, however small.** Small batches are easier to clear than a backlog of eighty, and letting reviews pile up is the classic WaniKani failure mode. Raise `threshold` if you'd rather hear less.
- **New reviews ping straight away.** WaniKani releases them on the hour, so the count is stable in between and this can't produce a flurry.
- **A backlog you're ignoring** gets nudged every 2 hours, not continuously.
- **Silent 22:00–07:00.**
- **Lessons get one nudge a day**, at the first check after 09:00 — they have no SRS clock and the daily allowance is always full against a backlog, so a review-style rule would nag about a number that never changes. Set `lessonNudgeHour` to move it.
- **Clearing your reviews resets it**, so the next batch pings fresh instead of being swallowed by a cooldown.

Override any of it in `~/.config/nihongo/config.json`:

```json
{ "threshold": 5, "growth": 10, "cooldownHours": 3,
  "quietFrom": 22, "quietTo": 7,
  "lessonThreshold": 1, "lessonNudgeHour": 9, "lessonDailyCap": 20 }
```

### The lesson count, and why it may not match your dashboard

WaniKani has a **Maximum Recommended Daily Lessons** setting (App Settings,
0–100). Your dashboard shows today's metered allowance; the v2 API reports the
entire unlocked backlog. So the dashboard can say 20 while the API says 81.

That setting **isn't exposed in the API**, so set `lessonDailyCap` to match it
by hand. The script then reports what you can actually do today — and because
it counts how many you've started since midnight, the number goes *down* as you
work and hits zero once you've done your daily allowance, instead of nagging
about lessons you've capped yourself out of.

Set `lessonDailyCap` to `null` to ignore the cap and report the full backlog.

## The reader

Stories live in a private artifact — a page holding everything you've read, with a **Library** view you can sort by date, lowest quiz score, or most-marked.

Reading a story, **tap a word** to show its furigana. If you still don't know it, the **EN?** chip reveals the English — and that's the press that counts against your coverage, so it's worth trying to read first. **Tap the bar beside a line** whose grammar didn't parse even though you knew every word.

Three different problems, tracked separately because they get fixed in opposite directions:

| You needed | That's a | Fix |
|---|---|---|
| The reading | kanji gap | same words, more kana |
| The English | vocabulary gap | easier words, more repetition |
| The whole line | grammar gap | lower the grammar floor |

**Known-word coverage** updates live as you read: the share of words you didn't need the English for. Below 95% you're decoding rather than reading, which is where people give up — and it's the same threshold story generation aims at, so the number that measures you is the number that steers what comes next.

At the bottom: **Finish & write a new one**. It archives the current story with your marks and score, then writes a fresh one on the spot. No terminal, which is the point when you're reading on a phone.

Those in-page stories use the same vocabulary and grammar limits but can't adapt — the page can't read your marks and reason about them, or decide the grammar floor should come down. `/nihongo-story` is what moves your level; the button keeps the habit alive between sessions.

Rebuild and republish the page only when your **vocabulary** changes:

```bash
node scripts/wanikani-pull.mjs && node scripts/build-reader.mjs
```

Adding a story needs no republish — stories live in the page's database.

## How the stories stay readable

**Around 98% of the words are ones you already know.** That's the extensive-reading threshold — below roughly 95%, reading turns into decoding with a dictionary and people quit. So a story carries at most one or two unfamiliar items, inferable from context.

Kanji follows WaniKani exactly: **Guru or above written bare**, Apprentice with furigana, anything not yet unlocked in kana. You never meet a kanji ahead of the curriculum.

Each story deliberately seeds two or three items currently at Apprentice. WaniKani teaches words in isolation; meeting one in a sentence, doing a job, is what turns a flashcard answer into a word you know.

Grammar is capped by [reference/story-grammar.md](reference/story-grammar.md) — **edit that file as you learn.** It exists because WaniKani teaches no grammar at all, so without a floor you'd know every word in a sentence and still not be able to read it.

## Layout

```
templates/reader.html         the reader page — built into me/ with your vocabulary
scripts/build-reader.mjs      injects your Guru+ vocabulary + grammar floor into it
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

## Sharing it

Everything personal is gitignored — your WaniKani pull, your stories, your
reader page and its artifact URL. A clone starts empty and `/nihongo-setup`
builds it, so the repo is safe to hand to anyone.

Two things deliberately **don't** travel:

- **Your token.** It lives in `~/.config/nihongo/`, never in the repo.
- **Your reader artifact.** It's private to your Claude account and holds your
  vocabulary, so the URL is no use to anyone else. `/nihongo-story` publishes a
  fresh one per person from `templates/reader.html` and records it in
  `me/reader-url.txt`.
