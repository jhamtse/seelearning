@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found.
  echo Please install it first: go to nodejs.org, download the LTS version, install it, then double-click this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First-time setup: installing the app ^(this can take a minute or two^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo ==========================================================
    echo Setup failed. Scroll up to see the error message above.
    echo If you're not sure what it means, copy this whole window's
    echo text and share it so it can be fixed.
    echo ==========================================================
    pause
    exit /b 1
  )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Found an old copy of this app still running in the background — stopping it first...
  taskkill /F /PID %%a >nul 2>nul
)

echo.
echo Starting Conference Organizer...
echo Your browser will open in a few seconds. If it doesn't, go to http://localhost:3000
echo Leave this window open while you use the app. Close it to stop.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"
call npm run dev

echo.
echo ==========================================================
echo The app has stopped. If that was unexpected, scroll up to
echo see if there's an error message, and share this window's
echo text so it can be fixed.
echo ==========================================================
pause
