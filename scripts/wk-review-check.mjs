#!/usr/bin/env node
// Check WaniKani for available reviews and raise a macOS notification.
// Designed to be run on a schedule by launchd. See scripts/install-agent.sh.
//
// Token: $WANIKANI_TOKEN, or ~/.config/nihongo/wanikani.token
//
//   node scripts/wk-review-check.mjs            check, notify if warranted
//   node scripts/wk-review-check.mjs --status   print state, never notify
//   node scripts/wk-review-check.mjs --test     force a notification
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
  // Don't nag over a trickle. WaniKani drips reviews in; being pinged for
  // three is worse than useless because you learn to ignore the pings.
  threshold: 5,
  // Re-notify early if this many more have piled up since the last ping.
  growth: 10,
  // Otherwise stay quiet this long before nudging about the same backlog.
  cooldownHours: 3,
  // Local hours. No notifications inside this window.
  quietFrom: 22,
  quietTo: 7,
  notifyLessons: true,
};

const args = new Set(process.argv.slice(2));
const flag = n => args.has(`--${n}`);

function readJSON(path, fallback) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; }
}

function token() {
  if (process.env.WANIKANI_TOKEN) return process.env.WANIKANI_TOKEN.trim();
  if (existsSync(TOKEN_FILE)) return readFileSync(TOKEN_FILE, "utf8").trim();
  console.error(
    `No WaniKani token found.\n\n` +
    `  1. Create one (read-only scope is enough):\n` +
    `     https://www.wanikani.com/settings/personal_access_tokens\n\n` +
    `  2. Save it:\n` +
    `     mkdir -p ~/.config/nihongo && chmod 700 ~/.config/nihongo\n` +
    `     printf '%s' 'YOUR_TOKEN' > ~/.config/nihongo/wanikani.token\n` +
    `     chmod 600 ~/.config/nihongo/wanikani.token`
  );
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
  const lessons = availableNow(data.lessons, now);
  const nextAt = data.next_reviews_at ? new Date(data.next_reviews_at) : null;

  if (flag("status")) {
    const [would, why] = shouldNotify(reviews, state, cfg, now);
    console.log(
      `reviews available : ${reviews}\n` +
      `lessons available : ${lessons}\n` +
      `next reviews at   : ${nextAt ? nextAt.toLocaleString() : "—"}\n` +
      `last notified     : ${state.lastNotifiedAt ? new Date(state.lastNotifiedAt).toLocaleString() : "never"}\n` +
      `would notify now  : ${would} (${why})`
    );
    return;
  }

  // Backlog cleared — forget the last ping so the next batch notifies fresh
  // instead of being swallowed by the cooldown.
  if (reviews === 0) {
    writeFileSync(STATE_FILE, JSON.stringify({ lastSeenCount: 0 }, null, 2));
    if (!flag("quiet")) console.log("No reviews available. State reset.");
    return;
  }

  const [should, why] = shouldNotify(reviews, state, cfg, now);
  if (!should) {
    writeFileSync(STATE_FILE, JSON.stringify({ ...state, lastSeenCount: reviews }, null, 2));
    if (!flag("quiet")) console.log(`${reviews} waiting — not notifying: ${why}`);
    return;
  }

  const bits = [plural(reviews, "review")];
  if (cfg.notifyLessons && lessons > 0) bits.push(plural(lessons, "lesson"));

  await notify("WaniKani", `${bits.join(" · ")} ready`);

  writeFileSync(STATE_FILE, JSON.stringify({
    lastNotifiedAt: now.toISOString(),
    lastNotifiedCount: reviews,
    lastSeenCount: reviews,
  }, null, 2));

  if (!flag("quiet")) console.log(`Notified: ${bits.join(" · ")} (${why})`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
