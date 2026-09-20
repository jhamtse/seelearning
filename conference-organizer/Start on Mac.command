#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js not found" message "Please install Node.js first: go to nodejs.org, download the LTS version, install it, then double-click this file again."'
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First-time setup: installing the app (this can take a minute or two)..."
  npm install
fi

echo ""
echo "Starting Conference Organizer..."
echo "Your browser will open in a few seconds. If it doesn't, go to http://localhost:3000"
echo "Leave this window open while you use the app. Close it (or press Ctrl+C) to stop."
echo ""

( sleep 3 && open "http://localhost:3000" ) &
npm run dev
