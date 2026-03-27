@echo off
REM Mini Song Vercel Deployment Setup Script
REM This script helps you prepare for Vercel deployment

cls
echo.
echo ============================================================
echo  Mini Song - Vercel Deployment Setup
echo ============================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version > nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js is installed

REM Check npm
echo Checking npm installation...
npm --version > nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: npm is not installed!
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)
echo OK: npm is installed

echo.
echo ============================================================
echo Selected Setup Type
echo ============================================================
echo 1. Install dependencies only
echo 2. Full setup (install + create .env)
echo 3. Just create .env file
echo 4. View documentation
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto fullsetup
if "%choice%"=="3" goto envonly
if "%choice%"=="4" goto docs
if "%choice%"=="5" exit /b 0
goto invalid

:install
echo.
echo Installing Node.js dependencies...
cd backend
echo.
echo Installing backend packages...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)
cd ..
echo.
echo ✅ Dependencies installed successfully!
pause
exit /b 0

:fullsetup
echo.
echo Full setup starting...
cd backend
echo.
echo Installing backend packages...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install packages
    pause
    exit /b 1
)

echo.
echo.
echo ============================================================
echo Creating .env file
echo ============================================================
echo.
if exist .env (
    echo .env file already exists. Keeping it.
) else (
    echo Creating .env file...
    (
        echo PORT=5000
        echo NODE_ENV=development
        echo JWT_SECRET=your_secret_key_make_this_long_random_32_chars_minimum
        echo.
        echo DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_song
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=mini_song
        echo DB_USER=postgres
        echo DB_PASSWORD=password
    ) > .env
    echo.
    echo ✅ .env file created!
    echo.
    echo IMPORTANT: Edit .env with your actual database credentials!
    echo   1. For local testing: Use local PostgreSQL credentials
    echo   2. For production: Use Supabase connection string
)
cd ..

echo.
echo ✅ Full setup complete!
echo.
echo Next steps:
echo 1. Edit backend/.env with your database credentials
echo 2. Test locally: cd backend && npm run dev
echo 3. Read DEPLOYMENT.md for complete guide
echo.
pause
exit /b 0

:envonly
echo.
cd backend
if exist .env (
    echo .env file already exists!
    echo Would you like to overwrite it? (y/n)
    set /p overwrite=
    if /i "%overwrite%"=="y" (
        del .env
    ) else (
        echo Keeping existing .env file
        cd ..
        pause
        exit /b 0
    )
)

echo Creating .env file...
(
    echo PORT=5000
    echo NODE_ENV=development
    echo JWT_SECRET=your_secret_key_make_this_long_random_32_chars_minimum
    echo.
    echo DATABASE_URL=postgresql://postgres:password@localhost:5432/mini_song
    echo DB_HOST=localhost
    echo DB_PORT=5432
    echo DB_NAME=mini_song
    echo DB_USER=postgres
    echo DB_PASSWORD=password
) > .env
cd ..

echo.
echo ✅ .env file created!
echo.
echo IMPORTANT: Edit backend/.env with your actual database credentials!
pause
exit /b 0

:docs
echo.
echo Opening documentation files...
echo.
echo Choose which file to view:
echo 1. VERCEL_READY.md (Quick overview)
echo 2. DEPLOYMENT.md (Detailed guide)
echo 3. DEPLOYMENT_CHECKLIST.md (Task list)
echo 4. MIGRATION_SUMMARY.md (What changed)
echo 5. Go back
echo.
set /p docChoice="Enter your choice (1-5): "

if "%docChoice%"=="1" (
    start notepad VERCEL_READY.md
) else if "%docChoice%"=="2" (
    start notepad DEPLOYMENT.md
) else if "%docChoice%"=="3" (
    start notepad DEPLOYMENT_CHECKLIST.md
) else if "%docChoice%"=="4" (
    start notepad MIGRATION_SUMMARY.md
) else if "%docChoice%"=="5" (
    goto start
)

goto end

:invalid
echo.
echo ERROR: Invalid choice!
pause
exit /b 1

:end
pause
exit /b 0
