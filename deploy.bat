@echo off
echo 🚀 English-Hebrew Line Drawing Game - Auto Deploy
echo ================================================

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    git branch -M main
)

echo Adding all files...
git add .

set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update English-Hebrew Line Drawing Game

echo Committing changes...
git commit -m "%commit_msg%"

echo.
echo To complete deployment:
echo 1. Create repository on GitHub: https://github.com/new
echo 2. Run: git remote add origin https://github.com/USERNAME/REPO_NAME.git
echo 3. Run: git push -u origin main
echo 4. Enable GitHub Pages in repository settings
echo.
echo Your game will be available at: https://USERNAME.github.io/REPO_NAME/
echo.
pause 