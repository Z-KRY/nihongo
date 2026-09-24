#!/usr/bin/env node
// Check WaniKani for available reviews and raise a macOS notification.
// Designed to be run on a schedule by launchd. See scripts/install-agent.sh.
//
// Token: $WANIKANI_TOKEN, or ~/.config/nihongo/wanikani.token
//
//   node scripts/wk-review-check.mjs            check, notify if warranted
//   node scripts/wk-review-check.mjs --status   print state, never notify
//   node scripts/wk-review-check.mjs --test     send a test notification
//   node scripts/wk-review-check.mjs --force    ignore cooldown and quiet hours

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const CONFIG_DIR = join(homedir(), ".config", "nihongo");
const TOKEN_FILE = join(CONFIG_DIR, "wanikani.token");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const STATE_FILE = join(CONFIG_DIR, "notify-state.json");

const DEFAULTS = {
  // Flag every batch, however small. Letting reviews pile up is the classic
  // WaniKani failure mode, and small batches are far easier to clear than a
  // backlog of eighty. Raise this if you'd rather be told less often.
  threshold: 1,
  // Re-notify once this many more have appeared. WaniKani releases reviews on
  // the hour, so the count is stable in between and 1 can't cause a flurry.
  growth: 1,
  // A backlog you're ignoring gets nudged this often. New reviews ping
  // immediately via `growth` regardless.
  cooldownHours: 2,
  // Local hours. No notifications inside this window.
  quietFrom: 22,
  quietTo: 7,
  // Lessons are the restart phase: after a level reset you have a pile of
  // lessons and zero reviews, because reviews only exist once lessons are
  // done. Worth its own nudge — but lessons have no SRS clock, so they sit
  // there indefinitely and a review-rate cooldown would nag all day.
  notifyLessons: true,
  lessonThreshold: 1,
  // Once per calendar day, not a rolling cooldown — a rolling window drifts
  // to a different time each day, and the thing being built here is a habit.
  // Sent at the first check at or after this local hour.
  lessonNudgeHour: 9,
  // WaniKani's "Maximum Recommended Daily Lessons" (App Settings, 0-100).
  // The v2 API reports the entire unlocked lesson backlog and does NOT expose
  // this setting, so the dashboard can say 20 while the API says 81. Set it
  // here to match and notifications report what you can actually do today.
  // null = no cap, report the full backlog.
  lessonDailyCap: null,
};

const args = new Set(process.argv.slice(2));
const flag = n => args.has(`--${n}`);

function readJSON(path, fallback) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
}

// WaniKani tokens are UUIDs. Anything else in the file is almost certainly a
// setup instruction that got run verbatim — say so, rather than letting it
// fail as an opaque 401 every 15 minutes.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reenterHint() {
  return `Re-enter it without echoing to screen or shell history:\n\n` +
    `  read -rs WK_TOKEN && printf '%s' "$WK_TOKEN" > ${TOKEN_FILE} \\\n` +
    `    && chmod 600 ${TOKEN_FILE} && unset WK_TOKEN\n\n` +
    `Token: https://www.wanikani.com/settings/personal_access_tokens`;
}

function token() {
  if (process.env.WANIKANI_TOKEN) return process.env.WANIKANI_TOKEN.trim();
  if (existsSync(TOKEN_FILE)) {
    const t = readFileSync(TOKEN_FILE, "utf8").trim();
    if (!UUID.test(t)) {
      console.error(
        `The token file doesn't contain a WaniKani token.\n\n` +
        `  ${TOKEN_FILE}\n` +
        `  contains: ${JSON.stringify(t.slice(0, 24))}${t.length > 24 ? "…" : ""}\n\n` +
        `A WaniKani token is a UUID. If that looks like placeholder text, a setup\n` +
        `command was run without substituting the real token.\n\n` + reenterHint()
      );
      process.exit(1);
    }
    return t;
  }
  console.error(`No WaniKani token found.\n\n` + reenterHint());
  process.exit(1);
}

async function notify(title, message, { sound = true } = {}) {
  // osascript is the only no-install option on macOS. Notifications raised
  // this way are attributed to Script Editor, so that app needs notification
  // permission — run with --test to confirm they actually land before
  // trusting the schedule.
  const esc = s => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const script =
    `display notification "${esc(message)}" with title "${esc(title)}"` +
    (sound ? ` sound name "Glass"` : "");
  try {
    await run("/usr/bin/osascript", ["-e", script]);
    return true;
  } catch (e) {
    console.error(`Notification failed: ${e.message}`);
    return false;
  }
}

async function summary(tok) {
  const res = await fetch("https://api.wanikani.com/v2/summary", {
    headers: { Authorization: `Bearer ${tok}`, "Wanikani-Revision": "20170710" },
  });
  if (res.status === 401) {
    console.error("WaniKani rejected the token (401). Check it hasn't been revoked.");
    process.exit(1);
  }
  if (!res.ok) throw new Error(`WaniKani returned ${res.status} ${res.statusText}`);
  return res.json();
}

// The summary's `reviews` array buckets the next 24 hours by availability.
// Everything with available_at at or before now is waiting for you.
function availableNow(buckets, now) {
  return (buckets ?? [])
    .filter(b => new Date(b.available_at) <= now)
    .reduce((n, b) => n + b.subject_ids.length, 0);
}

// How many lessons were started since local midnight. A static daily cap
// would keep reporting 20 after you'd done 15 of them; this makes the count
// decrease as you work, and reach zero when you've hit your own limit.
//
// There's no started_after filter on /assignments, so filter updated_after
// (which keeps the response small) and check started_at client-side.
async function lessonsDoneToday(tok, now) {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const url = `https://api.wanikani.com/v2/assignments?updated_after=${midnight.toISOString()}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tok}`, "Wanikani-Revision": "20170710" },
    });
    if (!res.ok) return null;          // fall back to the uncapped number
    const { data } = await res.json();
    return data.filter(a => a.data.started_at && new Date(a.data.started_at) >= midnight).length;
  } catch {
    return null;
  }
}

function inQuietHours(now, cfg) {
  const h = now.getHours();
  return cfg.quietFrom > cfg.quietTo
    ? (h >= cfg.quietFrom || h < cfg.quietTo)   // window wraps midnight
    : (h >= cfg.quietFrom && h < cfg.quietTo);
}

function shouldNotify(count, state, cfg, now) {
  if (count < cfg.threshold) return [false, `below threshold (${count} < ${cfg.threshold})`];
  if (!flag("force") && inQuietHours(now, cfg)) return [false, "quiet hours"];
  if (!state.lastNotifiedAt) return [true, "first notification for this backlog"];

  const elapsedH = (now - new Date(state.lastNotifiedAt)) / 36e5;
  if (count >= state.lastNotifiedCount + cfg.growth)
    return [true, `grown by ${count - state.lastNotifiedCount} since last ping`];
  if (flag("force") || elapsedH >= cfg.cooldownHours)
    return [true, `${elapsedH.toFixed(1)}h since last ping`];

  return [false, `cooling down (${(cfg.cooldownHours - elapsedH).toFixed(1)}h left)`];
}

const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Lessons have no SRS clock and, against a backlog, the daily allowance is
// always full — so a review-style trigger would nag about a number that never
// changes. One nudge per calendar day at a fixed hour instead.
function shouldNotifyLessons(count, state, cfg, now) {
  if (!cfg.notifyLessons) return [false, "lesson notifications off"];
  if (count < cfg.lessonThreshold)
    return [false, `below lesson threshold (${count} < ${cfg.lessonThreshold})`];
  if (flag("force")) return [true, "forced"];
  if (inQuietHours(now, cfg)) return [false, "quiet hours"];

  const today = localDate(now);
  if (state.lessonsNotifiedDate === today)
    return [false, `already nudged today (${today})`];
  if (now.getHours() < cfg.lessonNudgeHour)
    return [false, `before ${cfg.lessonNudgeHour}:00`];

  return [true, `daily nudge for ${today}`];
}

function plural(n, word) { return `${n} ${word}${n === 1 ? "" : "s"}`; }

async function main() {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const cfg = { ...DEFAULTS, ...readJSON(CONFIG_FILE, {}) };
  const state = readJSON(STATE_FILE, {});
  const now = new Date();

  if (flag("test")) {
    const ok = await notify("WaniKani", "Notifications are working. 🎉");
    console.log(ok
      ? "Sent. If nothing appeared, allow notifications for Script Editor in\n" +
        "System Settings → Notifications, then run this again."
      : "osascript failed — see the error above.");
    return;
  }

  const tok = token();
  const { data } = await summary(tok);

  const reviews = availableNow(data.reviews, now);
  const lessonBacklog = availableNow(data.lessons, now);
  const nextAt = data.next_reviews_at ? new Date(data.next_reviews_at) : null;

  // Report what's actually doable today, not the whole backlog — being told
  // 81 when your own daily limit is 20 is discouraging and wrong.
  let lessons = lessonBacklog, doneToday = null, capNote = "";
  if (cfg.lessonDailyCap != null) {
    doneToday = await lessonsDoneToday(tok, now);
    const remaining = doneToday == null
      ? cfg.lessonDailyCap
      : Math.max(0, cfg.lessonDailyCap - doneToday);
    lessons = Math.min(lessonBacklog, remaining);
    capNote = doneToday == null
      ? ` (capped at ${cfg.lessonDailyCap}; couldn't check today's progress)`
      : ` (${doneToday} done today, cap ${cfg.lessonDailyCap}, ${lessonBacklog} in backlog)`;
  }

  const save = extra =>
    writeFileSync(STATE_FILE, JSON.stringify({ ...state, ...extra }, null, 2));
  const say = msg => { if (!flag("quiet")) console.log(msg); };

  if (flag("status")) {
    const [wouldR, whyR] = shouldNotify(reviews, state, cfg, now);
    const [wouldL, whyL] = shouldNotifyLessons(lessons, state, cfg, now);
    console.log(
      `reviews available : ${reviews}\n` +
      `lessons available : ${lessons}${capNote}\n` +
      `next reviews at   : ${nextAt ? nextAt.toLocaleString() : "—"}\n` +
      `last review ping  : ${state.lastNotifiedAt ? new Date(state.lastNotifiedAt).toLocaleString() : "never"}\n` +
      `last lesson ping  : ${state.lessonsNotifiedDate ?? "never"}\n` +
      `would ping reviews: ${wouldR} (${whyR})\n` +
      `would ping lessons: ${wouldL} (${whyL})`
    );
    return;
  }

  if (reviews > 0) {
    const [should, why] = shouldNotify(reviews, state, cfg, now);
    if (!should) {
      save({ lastSeenCount: reviews });
      say(`${reviews} reviews waiting — not notifying: ${why}`);
      return;
    }
    const bits = [plural(reviews, "review")];
    if (cfg.notifyLessons && lessons > 0) bits.push(plural(lessons, "lesson"));
    await notify("WaniKani", `${bits.join(" · ")} ready`);
    save({ lastNotifiedAt: now.toISOString(), lastNotifiedCount: reviews, lastSeenCount: reviews });
    say(`Notified: ${bits.join(" · ")} (${why})`);
    return;
  }

  // No reviews. Clear the review-side state so the next batch pings fresh
  // rather than being swallowed by a stale cooldown.
  state.lastNotifiedAt = undefined;
  state.lastNotifiedCount = undefined;

  const [shouldL, whyL] = shouldNotifyLessons(lessons, state, cfg, now);
  if (!shouldL) {
    save({ lastSeenCount: 0 });
    say(`No reviews. ${lessons} lessons — not notifying: ${whyL}`);
    return;
  }

  await notify("WaniKani", `${plural(lessons, "lesson")} waiting`);
  save({ lastSeenCount: 0, lessonsNotifiedDate: localDate(now) });
  say(`Notified: ${plural(lessons, "lesson")} (${whyL})`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
