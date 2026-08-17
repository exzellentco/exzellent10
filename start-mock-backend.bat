@echo off
cd /d "%~dp0mock-backend"
echo ============================================
echo   FAKE BACKEND (for developing without a real login)
echo ============================================
echo.
echo Leave THIS window open while you work.
echo Close it (or press Ctrl+C) to stop the fake backend.
echo.
node mock-server.cjs
echo.
echo The fake backend has stopped.
pause
