#!/bin/bash
# Install (or reinstall) the launchd agent that checks WaniKani for reviews.
#
#   ./scripts/install-agent.sh            install, checking every 15 minutes
#   ./scripts/install-agent.sh 1800       ... every 30 minutes
#   ./scripts/install-agent.sh --uninstall
#
# launchd, not cron: cron on macOS is deprecated and doesn't reliably run in a
# GUI session, which notifications need. A LaunchAgent (not a LaunchDaemon)
# runs as you, inside your session, which is what makes the notification land.

set -euo pipefail

LABEL="com.nihongo.wanikani-reviews"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO/scripts/wk-review-check.mjs"
LOG_DIR="$HOME/.config/nihongo"

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Uninstalled $LABEL"
  exit 0
fi

INTERVAL="${1:-900}"

# launchd gets no shell, so PATH doesn't exist as far as it's concerned —
# every path in the plist has to be absolute or the job dies silently.
NODE="$(command -v node || true)"
if [[ -z "$NODE" ]]; then
  echo "node not found on PATH. Install Node, then re-run." >&2
  exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>

    <key>ProgramArguments</key>
    <array>
        <string>$NODE</string>
        <string>$SCRIPT</string>
        <string>--quiet</string>
    </array>

    <key>StartInterval</key>
    <integer>$INTERVAL</integer>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardErrorPath</key>
    <string>$LOG_DIR/agent.err.log</string>
    <key>StandardOutPath</key>
    <string>$LOG_DIR/agent.out.log</string>

    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
PLIST_EOF

launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID" "$PLIST"

echo "Installed $LABEL"
echo "  checks every $((INTERVAL / 60)) min"
echo "  errors   → $LOG_DIR/agent.err.log"
echo
echo "Verify:"
echo "  launchctl print gui/$UID/$LABEL | head -20"
echo "  node $SCRIPT --status"
