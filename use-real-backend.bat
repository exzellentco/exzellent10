@echo off
cd /d "%~dp0"
echo ============================================
echo   SWITCH THE WEBSITE BACK TO THE REAL SITE
echo ============================================
echo.

if exist ".env.local" (
  del ".env.local"
  echo [OK] Removed the fake-backend override.
) else (
  echo [--] It was already using the real backend.
)

echo.
echo The website will use the REAL backend again
echo (https://exzellent-backend-1.onrender.com).
echo.
echo RESTART the website for this to take effect:
echo   - close the window running "npm run dev"
echo   - run  npm run dev  again
echo.
echo NOTE: the real backend needs a real account to log in.
echo.
pause
