#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js not found" message "Please install Node.js first: go to nodejs.org, download the LTS version, install it, then double-click this file again."'
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First-time setup: installing the app (this can take a minute or two)..."
  if ! npm install; then
    echo ""
    echo "=========================================================="
    echo "Setup failed. Scroll up to see the error message above."
    echo "If you're not sure what it means, copy this whole window's"
    echo "text and share it so it can be fixed."
    echo "=========================================================="
    read -p "Press Enter to close this window..."
    exit 1
  fi
fi

echo ""
echo "Starting Conference Organizer..."
echo "Your browser will open in a few seconds. If it doesn't, go to http://localhost:3000"
echo "Leave this window open while you use the app. Close it (or press Ctrl+C) to stop."
echo ""

( sleep 3 && open "http://localhost:3000" ) &
npm run dev
status=$?

# 130/143 = you closed this window or pressed Ctrl+C on purpose; not an error.
if [ $status -ne 0 ] && [ $status -ne 130 ] && [ $status -ne 143 ]; then
  echo ""
  echo "=========================================================="
  echo "The app stopped with an error. Scroll up to see what it says."
  echo "If you're not sure what it means, copy this whole window's"
  echo "text and share it so it can be fixed."
  echo "=========================================================="
  read -p "Press Enter to close this window..."
fi
