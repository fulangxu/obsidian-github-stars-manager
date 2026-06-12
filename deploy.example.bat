@echo off
chcp 65001 >nul
echo Deploy Obsidian GitHub Stars Manager Plugin
echo ==========================================
echo.

:: Read plugin directory from environment variable
:: Set this via: setx OBSIDIAN_PLUGIN_DIR "your-path"
:: Or create a .env file with OBSIDIAN_PLUGIN_DIR="your-path"
if "%OBSIDIAN_PLUGIN_DIR%"=="" (
    echo Error: OBSIDIAN_PLUGIN_DIR environment variable is not set.
    echo Please run: setx OBSIDIAN_PLUGIN_DIR "C:\Users\YourName\YourVault\.obsidian\plugins"
    echo Or copy .env.example to .env and set the path there.
    pause
    exit /b 1
)

set "TARGET_DIR=%OBSIDIAN_PLUGIN_DIR%\github-stars-manager"

echo Target: %TARGET_DIR%
echo.

if not exist "%TARGET_DIR%" (
    echo Creating target directory...
    mkdir "%TARGET_DIR%"
)

echo Deploying...
echo.

if exist "main.js" (
    copy "main.js" "%TARGET_DIR%\main.js" >nul
    echo Done: main.js
) else (
    echo Warning: main.js not found, run npm run build first
)

if exist "styles.css" (
    copy "styles.css" "%TARGET_DIR%\styles.css" >nul
    echo Done: styles.css
)

if exist "manifest.json" (
    copy "manifest.json" "%TARGET_DIR%\manifest.json" >nul
    echo Done: manifest.json
)

echo.
echo Deploy complete: %TARGET_DIR%
echo Reload the plugin in Obsidian to see changes.
echo.
pause
