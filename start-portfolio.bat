@echo off
echo ========================================================
echo   Launching Abhijeet Bhandari's 3D Character Portfolio
echo ========================================================
echo.

:: Try jwebserver (built into Java 21)
where jwebserver >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo Starting local web server with jwebserver on port 3000...
  start "" http://localhost:3000
  jwebserver -d "%~dp0" -p 3000
) else (
  echo Opening index.html directly in your default browser...
  start "" "%~dp0index.html"
)
