@echo off
title Field Service App - Full Local Stack
echo.
echo === Starting Field Service App (Web + Firebase Emulators) ===
echo.

REM --- Check Firebase CLI ---
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo Firebase CLI not found. Installing globally...
    npm install -g firebase-tools
)

REM --- Install dependencies (only if not already done) ---
if not exist "web\node_modules" (
    echo Installing web dependencies...
    npm --prefix web install
)
if not exist "firebase\functions\node_modules" (
    echo Installing functions dependencies...
    npm --prefix firebase\functions install
)

REM --- Start Firebase emulators in background ---
start "Firebase Emulators" cmd /k "firebase emulators:start --only auth,firestore,storage,functions --import=./firebase/.seed --export-on-exit"

REM --- Wait 5 seconds to ensure emulators start ---
timeout /t 5 /nobreak >nul

REM --- Open emulator UI ---
start http://localhost:4000

REM --- Start Next.js web app ---
cd web
start "Web App" cmd /k "npm run dev"

REM --- Open web app in browser ---
start http://localhost:3000

echo.
echo All services started!
echo Web App:        http://localhost:3000
echo Emulator UI:    http://localhost:4000
echo.
pause
