@echo off

echo Restarting Multi-Card server
echo 
echo Stopping Multi-Card server...

node service-uninstall.cjs

echo Stopped Multi-Card server
echo 

.\start.bat

if %errorlevel% neq 0 (
  echo Server restart failed.
  exit /b %errorlevel%
)

echo Server restarted successfully