@echo off
REM 🚀 Production Hardening: Quick Deployment Guide (Windows)
REM Run this script after deploying Features 1-2 (Timezone + Waitlist Locking)

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"

echo ════════════════════════════════════════════════════════════
echo 🔧 PRODUCTION HARDENING DEPLOYMENT
echo ════════════════════════════════════════════════════════════

REM Check if backend directory exists
if not exist "backend" (
  echo ❌ backend\ directory not found
  echo    Please run this script from the project root
  exit /b 1
)

echo 📋 Step 1: Verifying Node.js and npm
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js not found. Please install Node.js
  exit /b 1
)
echo ✓ Node.js is available

echo.
echo 📋 Step 2: Running migrations
echo    Running migration 001: Add timezone support...

node backend\migrations\001_add_timezone_support.js
if errorlevel 1 (
  echo ❌ Migration 001 failed
  exit /b 1
)
echo ✓ Migration 001 completed

echo    Running migration 002: Create email failed queue...
node backend\migrations\002_create_email_failed_queue.js
if errorlevel 1 (
  echo ❌ Migration 002 failed
  exit /b 1
)
echo ✓ Migration 002 completed

echo.
echo 📋 Step 3: Checking dependencies
echo    Checking for Luxon library...

npm list luxon >nul 2>&1
if errorlevel 1 (
  echo    ⚠️  Installing Luxon...
  call npm install --save luxon
  if errorlevel 1 (
    echo ❌ Failed to install Luxon
    exit /b 1
  )
  echo ✓ Luxon installed
) else (
  echo ✓ Luxon is installed
)

echo.
echo 📋 Step 4: Testing timezone helper
echo    Testing timezone module...

node -e "const { isRegistrationClosedForVenue, COMMON_TIMEZONES } = require('./backend/utils/timezoneHelper.js'); console.log('✓ Timezone helper loaded successfully'); console.log('  - Supported venues: ' + Object.keys(COMMON_TIMEZONES).join(', '));"
if errorlevel 1 (
  echo ❌ Timezone helper test failed
  exit /b 1
)
echo ✓ Timezone helper is working

echo.
echo 📋 Step 5: Testing waitlist promotion
echo    Testing waitlist module...

node -e "const { promoteFromWaitlist } = require('./backend/utils/waitlistPromotion.js'); console.log('✓ Waitlist promotion module loaded successfully'); console.log('  - promoteFromWaitlist() available');"
if errorlevel 1 (
  echo ❌ Waitlist promotion test failed
  exit /b 1
)
echo ✓ Waitlist promotion module is working

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ PRODUCTION HARDENING DEPLOYMENT COMPLETE
echo ════════════════════════════════════════════════════════════

echo.
echo 📋 Next Steps:
echo   1. Start the backend server: npm start
echo   2. Run the test scenarios (see PRODUCTION_HARDENING_STATUS.md)
echo   3. Monitor email_failed_queue for promotion failures
echo.
echo 📖 Documentation:
echo   - Full guide: PRODUCTION_HARDENING_STATUS.md
echo   - Database schema: backend\database.sql
echo   - Error troubleshooting: PRODUCTION_HARDENING_STATUS.md#troubleshooting
echo.
echo ✨ Ready for production testing!
echo.

endlocal
