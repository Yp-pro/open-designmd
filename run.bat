@echo off
title Run Open DesignMD (Portable)
echo ========================================================
echo   Starting Open DesignMD (Portable Version)
echo ========================================================
echo.

set "BASE_DIR=%~dp0"
set "PORTABLE_DIR=%BASE_DIR%designmd-portable"
set "NODE_DIR=%PORTABLE_DIR%\node"
set "CACHE_DIR=%PORTABLE_DIR%\npm-cache"

if not exist "%NODE_DIR%\node.exe" (
    echo [ERROR] Portable Node.js not found.
    echo Please run install.bat first.
    pause
    exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"
set "NPM_CONFIG_CACHE=%CACHE_DIR%"
set "NPM_CONFIG_PREFIX=%NODE_DIR%"

cd /d "%BASE_DIR%"

echo Starting Next.js development server...
echo.

:: Silent background browser launcher
start /b powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

echo Once the server initializes, your browser should open automatically.
echo If it does not, you can access it at: http://localhost:3000
echo Press Ctrl+C in this window to stop the server.
echo.

call npm run dev

pause