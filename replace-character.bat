@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Abhi's 3D Portfolio - Character Replacement Tool
echo ========================================================
echo.

if "%~1"=="" (
    echo [!] Usage: Drag and drop your new .glb file onto this bat file
    echo     Or run: replace-character.bat "path\to\your-model.glb"
    echo.
    set /p MODEL_PATH="Or paste the full path to your .glb file here: "
) else (
    set MODEL_PATH=%~1
)

:: Strip surrounding quotes
set MODEL_PATH=%MODEL_PATH:"=%

if not exist "!MODEL_PATH!" (
    echo [ERROR] File not found: !MODEL_PATH!
    pause
    exit /b 1
)

echo [*] Copying new 3D model to me.glb...
copy /y "!MODEL_PATH!" "%~dp0me.glb" >nul

echo [*] Generating offline zero-CORS bundle (modelData.js)...
powershell -Command "$bytes = [System.IO.File]::ReadAllBytes('%~dp0me.glb'); $b64 = [System.Convert]::ToBase64String($bytes); [System.IO.File]::WriteAllText('%~dp0modelData.js', 'window.CHARACTER_MODEL_BASE64 = ''data:application/octet-stream;base64,' + $b64 + ''';'); Write-Output 'Done! Model size: ' + [math]::Round($bytes.Length / 1MB, 2) + ' MB'"

echo.
echo [SUCCESS] Your custom character has been installed!
echo [*] Opening portfolio in your browser to preview...
start "" "%~dp0index.html"
echo.
pause
