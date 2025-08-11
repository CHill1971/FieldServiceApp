@echo off
title Stop Field Service App
echo.
echo === Stopping Field Service App (Web + Firebase Emulators) ===
echo.

REM Kill Firebase emulator window
taskkill /FI "WINDOWTITLE eq Firebase Emulators" /T /F >nul 2>&1

REM Kill Web App window
taskkill /FI "WINDOWTITLE eq Web App" /T /F >nul 2>&1

echo.
echo All Field Service App processes stopped.
echo.
pause
