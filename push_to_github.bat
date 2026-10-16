@echo off
title SafeReach - Push to GitHub
echo ========================================================
echo           Pushing SafeReach to GitHub
echo ========================================================
echo.
echo Target: https://github.com/alaaelbakery/SafeReach.git
echo Branch: main
echo.
echo Make sure you have created the 'SafeReach' repository on:
echo https://github.com/new
echo.
pause
echo.
echo Uploading files to GitHub...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] SafeReach has been pushed to GitHub successfully!
) else (
    echo [ERROR] Push failed. Please check if you created the repository on GitHub and have access.
)
echo.
pause
