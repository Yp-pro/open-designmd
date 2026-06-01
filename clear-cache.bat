@echo off
title Clear Database Cache (Open DesignMD)
echo ========================================================
echo   Clearing Open DesignMD Database Cache
echo ========================================================
echo.

set "BASE_DIR=%~dp0"
set "PORTABLE_DIR=%BASE_DIR%designmd-portable"
set "NODE_DIR=%PORTABLE_DIR%\node"

if not exist "%NODE_DIR%\node.exe" (
    echo [ERROR] Portable Node.js not found.
    pause
    exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"

cd /d "%BASE_DIR%"
node clear-cache.js

echo.
echo ========================================================
pause