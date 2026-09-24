---
name: nihongo-setup
description: First-run setup for the nihongo repo — WaniKani token, notification permission, the scheduled review agent, daily lesson cap, and the first vocabulary pull. Use on a fresh clone, when me/vocabulary.md doesn't exist, or when the user says "set up nihongo", "get me started", "onboard me", or "install the reminders".
---

# Setup

Five steps. Three the user must do themselves — say so plainly rather than pretending otherwise.

## 1. Token — theirs to do

Check `~/.config/nihongo/wanikani.token` first; skip this if it holds a UUID.

Otherwise point them at https://www.wanikani.com/settings/personal_access_tokens (read-only scope is enough) and give them exactly this:

```bash
mkdir -p ~/.config/nihongo && chmod 700 ~/.config/nihongo
read -rs WK_TOKEN && printf '%s' "$WK_TOKEN" > ~/.config/nihongo/wanikani.token && chmod 600 ~/.config/nihongo/wanikani.token && unset WK_TOKEN
```

**Never ask them to paste a token into chat** — that writes a credential into the transcript. And never hand them a command with a placeholder to edit in: it gets run verbatim, which silently writes a dead token over a working one. `read -rs` has nothing to edit and keeps the token out of shell history too.

## 2. Notifications — needs their eyes

```bash
node scripts/wk-review-check.mjs --test
```

**Ask whether it actually appeared.** `osascript` returns success whether or not macOS displays anything, so this is unverifiable from here and the failure is silent — a reminder tool nobody sees is worse than none.

If not: System Settings → Notifications → **Script Editor** → allow. macOS attributes `osascript` notifications to it.

## 3. The agent

```bash
./scripts/install-agent.sh
```

launchd, checking every 15 minutes. Pass seconds to change it; `--uninstall` removes it.

## 4. Daily lesson cap — ask them

WaniKani's **Maximum Recommended Daily Lessons** (App Settings) meters the dashboard, and the v2 API doesn't expose it — so the API reports the full unlocked backlog and the numbers disagree, sometimes wildly after a level reset.

Ask what theirs is set to and write it to `~/.config/nihongo/config.json` as `lessonDailyCap`. If they don't use one, leave it `null`.

## 5. First pull

```bash
node scripts/wanikani-pull.mjs
```

Downloads the subject catalogue once (~9000 items, slow, cached after) and writes `me/vocabulary.md`.

Report their level and how many items are **solid** (Guru+). If solid is under ~50, say plainly that stories will be thin until they've done more lessons — better than producing something unreadable and letting them conclude they're the problem.

## Then

Offer a first story. `/nihongo-story` handles creating their reader artifact on first run.

## Don't

- Don't run the pull before the token is in place — it fails with an unhelpful wall of text.
- Don't install the agent before notifications are confirmed working.
- Don't skip asking about the lesson cap. The mismatch between 81 and 20 is confusing enough that it'll get reported as a bug.
