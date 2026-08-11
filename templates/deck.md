# SRS deck

**Scheduling:** `due` counts down by one each session. At 0 or below, review it.
- Correct → `interval` doubles, `due` = new interval
- Wrong → `interval` resets to 1, `due` = 1

**Direction:** at rung 1, quiz both directions — recognition is still being built. At rungs 2–3, production only (English → Japanese), since recognition is by then the easy half.

If more than 8 items are due, take the 8 with the shortest intervals and leave the rest for next session. Never blow the whole session on a review backlog.

| # | Prompt (EN) | Answer (JA) | Note | Interval | Due |
|---|---|---|---|---|---|
