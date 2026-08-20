# nihongo

A Japanese study project you run with [Claude Code](https://claude.com/claude-code). Clone it, run one setup command, and you get a tutor that remembers your level, tracks your mistakes, and schedules your reviews — plus **study-buddy** support that generates conversations and activities two learners can actually do together.

Not a course. It's a scaffold plus a set of tutoring rules; the syllabus comes from whatever textbook you own (Genki, Minna no Nihongo, Tobira, or nothing at all).

## TL;DR

```bash
git clone https://github.com/Z-KRY/nihongo.git && cd nihongo && claude
```

Then, inside Claude Code:

| | |
|---|---|
| **First time** | `/nihongo-setup` — a 5-minute interview, once ever |
| **Every day after** | `/nihongo` — that's the whole thing |
| **Quick question** | `/nihongo-ask` — one word or rule, answered and turned into a flashcard |
| **Drill on your phone** | `/nihongo-drill` — builds a flashcard page from your own deck |
| **Studying with someone** | `/nihongo-buddy export`, send them the file |

Everything else is optional reading.

## Quick questions

`/nihongo-ask` is for the questions that come up away from a session — *what's the word for station? is きみ rude? why is this wrong?*

It answers short, at your level, and **silently turns the answer into a flashcard.** That last part is the point: a word you asked for because you wanted it in the moment is the highest-retention word in your deck, so none of those questions get wasted.

It also logs to `me/questions.md`, which closes a loop — anything you ask three times is a gap rather than curiosity, and it gets promoted into a real lesson.

## Drilling

`/nihongo-drill` builds a flashcard page from your deck and publishes it as a private Artifact — tap to reveal, both directions, filter by section, and mora beat counts on single words (がっこう is four beats, and the small っ is one of them).

**It's a practice tool, not the system of record.** The spaced-repetition schedule stays in `me/srs/deck.md` and only `/nihongo` touches it, so drill as much as you like — nothing you do on the page changes your intervals. A run ends by listing what you missed, to bring back to a session.

The page carries your deck's notes across, which is the part that matters: the register warnings and false-friend traps travel with the cards. Re-run the command after a session adds vocabulary; it republishes to the same URL so a phone bookmark keeps working.

Your artifact contains your vocabulary, so its URL is no use to anyone else — but the skill ships with the repo. A study buddy clones and runs it against their own deck.

## What your first session looks like

You type `/nihongo`. Then:

1. **Review** — a handful of flashcards, one at a time. First session there's nothing due yet, so it skips.
2. **New vocabulary** — 5–8 words, always shown inside a sentence pattern you already know rather than as a bare list.
3. **Drill** — one pattern, rapid swaps. これは ほんです → これは ペンです → これは かばんです. Boring on purpose; that's what makes it stick.
4. **Close** — new words go into your review schedule, your progress file gets updated, one line on what's next.

~20 minutes. You don't have to prepare anything or remember where you left off — that's what `me/` is for.

Explanations come in your own language. Japanese appears in the drills, not in the scaffolding around them.

## Why a repo and not just chat

Everything that makes language learning work is *stateful*: a review schedule, a record of the mistakes you keep repeating, your own writing over time. Chat forgets. Files don't.

## Daily use

`/nihongo` runs one session, sized to the cadence you set at setup. It reviews what's due, teaches, drills, then writes your state back to `me/`. Stop any time — the next session picks up from the files.

## Study buddies

The part that doesn't exist in other setups. Two people running this repo can pair up:

```
/nihongo-buddy export          # writes me/profile.share.md — send it to your buddy
/nihongo-buddy add <name>      # after dropping their file into buddies/
/nihongo-buddy plan <name>     # generates activities for the two of you
```

`plan` computes the **intersection** of what you both know and builds activities inside it — scripted role-plays, information-gap tasks, substitution drills, teach-backs on the things one of you knows and the other doesn't. The reasoning behind the activity design is in [reference/activity-types.md](reference/activity-types.md).

Profiles are exchanged as a single small file. Send it however you like — Slack, email, a gist. No server, no accounts, and your journal never leaves your machine.

Buddies don't need to be at the same level. Where you differ, the plan assigns roles: the stronger partner asks and teaches, the other responds. Asymmetry is used, not averaged away.

## Layout

```
CLAUDE.md              tutoring rules — the production ladder, correction protocol
reference/
  crutch-phrases.md    the survival kit: how to stay in Japanese when stuck
  activity-types.md    paired activities and the rules for generating them
templates/             blanks that /nihongo-setup copies into me/
me/                    YOUR state — profile, progress, SRS deck, journal
buddies/               profiles your study buddies sent you
shared/                generated buddy plans, one directory per buddy
```

`me/`, `buddies/` and `shared/` are yours and are **gitignored** — a template that shipped one person's journal would make everyone who clones it inherit a stranger's profile. Everything else is template, so you can pull updates without conflicts:

```bash
git remote add upstream https://github.com/Z-KRY/nihongo.git
git pull upstream main
```

## Privacy

Your study state never leaves your machine unless you choose to send it.

- `me/journal/` holds your raw unedited attempts. Gitignored.
- `/nihongo-buddy export` ships level, grammar covered and weak points. **Never the journal.**
- Buddy profiles you import are gitignored too — someone else's data shouldn't ride along in your commits.

Want your own progress versioned and backed up? Point a **private** second remote at it:

```bash
git remote add private git@github.com:<you>/nihongo-me.git
git add -f me/ && git commit -m "my state" && git push private main
```

## Start here if you're new

Read [reference/crutch-phrases.md](reference/crutch-phrases.md) before anything else, even before grammar. Those phrases are what let you stay in a conversation instead of falling out of it, and they're pure memorisation — no grammar required.
