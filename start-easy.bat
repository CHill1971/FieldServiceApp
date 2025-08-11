@echo off
setlocal
title Field Service App — One Click Start

echo.
echo === Field Service App — One Click Start ===
echo This will install tools if missing, start Firebase emulators, and launch the web app.
echo.

REM --- Go to project root (this .bat should live in the project root) ---
cd /d "%~dp0"

REM --- Ensure Firebase CLI is installed ---
where firebase >nul 2>nul
if %errorlevel% neq 0 (
  echo [Setup] Installing Firebase CLI globally...
  npm install -g firebase-tools
)

REM --- Check Java (needed for Firestore/Storage emulators) ---
java -version >nul 2>&1
if %errorlevel% neq 0 (
  set NEED_JAVA=1
  echo [Notice] Java not found. Firestore/Storage emulators will be skipped.
  echo          Install Java (e.g., Temurin JDK 17) later for full stack.
) else (
  set NEED_JAVA=0
)

REM --- Make sure firebase.json exists (create minimal if missing) ---
if not exist "firebase.json" (
  echo [Setup] Creating firebase.json ...
  > firebase.json echo {
  >> firebase.json echo   "firestore": { "rules": "firebase/firestore.rules", "indexes": "firestore.indexes.json" },
  >> firebase.json echo   "storage": { "rules": "firebase/storage.rules" },
  >> firebase.json echo   "functions": { "source": "firebase/functions" },
  >> firebase.json echo   "emulators": {
  >> firebase.json echo     "auth": { "port": 9099 },
  >> firebase.json echo     "firestore": { "port": 8080 },
  >> firebase.json echo     "storage": { "port": 9199 },
  >> firebase.json echo     "functions": { "port": 5001 },
  >> firebase.json echo     "ui": { "enabled": true, "port": 4000 }
  >> firebase.json echo   }
  >> firebase.json echo }
)

REM --- Install dependencies if needed ---
if not exist "web\node_modules" (
  echo [Setup] Installing web dependencies...
  npm --prefix web install
)

if not exist "firebase\functions\node_modules" (
  echo [Setup] Installing functions dependencies...
  npm --prefix firebase\functions install
)

REM --- Try to build functions (non-fatal if it fails) ---
if "%NEED_JAVA%"=="0" (
  if exist "firebase\functions\tsconfig.json" (
    echo [Build] Building Cloud Functions...
    npm --prefix firebase\functions run build || echo [Warn] Functions build failed; continuing without functions.
  )
)

REM --- Start Firebase emulators ---
if "%NEED_JAVA%"=="0" (
  REM Full emulators (auth, firestore, storage); include functions if built
  echo [Start] Launching Firebase Emulators (Auth/Firestore/Storage/Functions)...
  start "Firebase Emulators" cmd /k ^
    "firebase emulators:start --only auth,firestore,storage,functions --import=./firebase/.seed --export-on-exit"
) else (
  echo [Start] Java missing: starting Auth emulator only (no Firestore/Storage).
  start "Firebase Emulators" cmd /k ^
    "firebase emulators:start --only auth --import=./firebase/.seed --export-on-exit"
)

REM --- Give emulators a moment ---
timeout /t 5 /nobreak >nul
start http://localhost:4000

REM --- Start Next.js dev server ---
echo [Start] Launching Web App...
start "Web App" cmd /k "cd /d %CD%\web && npm run dev"

REM --- Open web app ---
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo === All set! ===
echo Web App:      http://localhost:3000
echo Emulator UI:  http://localhost:4000
if "%NEED_JAVA%"=="1" echo Tip: Install Java (JDK 17+) to enable Firestore/Storage emulators.
echo.
pause
endlocal
