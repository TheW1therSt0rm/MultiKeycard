@echo off

echo Restarting Multi-Card server
echo 

.\stop.bat

echo 

.\start.bat

if %errorlevel% neq 0 (
  echo Server restart failed.
  exit /b %errorlevel%
)

echo Server restarted successfully