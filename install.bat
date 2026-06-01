@echo off
title Install Open DesignMD (Portable)
echo ========================================================
echo   Installing Open DesignMD (Portable Version)
echo ========================================================
echo.

set "BASE_DIR=%~dp0"
set "PORTABLE_DIR=%BASE_DIR%designmd-portable"
set "NODE_DIR=%PORTABLE_DIR%\node"
set "CACHE_DIR=%PORTABLE_DIR%\npm-cache"

if not exist "%PORTABLE_DIR%" (
    mkdir "%PORTABLE_DIR%"
)
cd /d "%PORTABLE_DIR%"

echo [1/3] Downloading Portable Node.js (v20.11.1 LTS)...
curl -L -o node.zip https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip
if errorlevel 1 (
    echo [ERROR] Failed to download Node.js.
    pause
    exit /b 1
)

echo [2/3] Extracting Node.js (please wait)...
if exist "node-temp" rmdir /s /q "node-temp"

powershell -NoProfile -Command "Expand-Archive -Path 'node.zip' -DestinationPath 'node-temp' -Force"

if exist "node" rmdir /s /q "node"

for /d %%i in (node-temp\*) do move "%%i" "node"

del node.zip
rmdir /s /q node-temp

echo [3/3] Setting up environment configuration (.env)...
cd /d "%BASE_DIR%"
if not exist ".env" (
    copy ".env.example" ".env" >nul
)

echo Installing project dependencies (npm install)...
set "PATH=%NODE_DIR%;%PATH%"
set "NPM_CONFIG_CACHE=%CACHE_DIR%"
set "NPM_CONFIG_PREFIX=%NODE_DIR%"

call npm install --no-audit --no-fund

echo.
echo ========================================================
echo   Installation completed successfully!
echo ========================================================
echo.
echo Portable Node.js is installed in: %NODE_DIR%
echo.
echo Action required:
echo Open and edit this file in Notepad to configure your AI provider:
echo %BASE_DIR%.env
echo.
echo After configuring, run "run.bat" to start the app.
echo ========================================================
pause