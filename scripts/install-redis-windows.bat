@echo off
REM 🧠 Redis Installation Script for Windows - Whispermind Conduit (Batch Wrapper)
REM 
REM Simple batch file wrapper for the PowerShell Redis installation script
REM This provides an easy way to run the installation for users who prefer batch files
REM
REM Author: Mad Tinker
REM Project: Madness Interactive - Whispermind Conduit

echo.
echo 🧠 Redis Installation for Whispermind Conduit 🧠
echo ================================================
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell is available'" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is not available on this system
    echo Please install PowerShell or run the installation manually
    pause
    exit /b 1
)

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  This script requires administrator privileges
    echo Please run this batch file as Administrator
    echo.
    echo To run as administrator:
    echo 1. Right-click this batch file
    echo 2. Select 'Run as administrator'
    pause
    exit /b 1
)

echo 🚀 Starting Redis installation via PowerShell...
echo.

REM Run the PowerShell script with parameters
if "%1"=="" (
    REM No parameters - use auto mode
    powershell -ExecutionPolicy Bypass -File "%~dp0install-redis-windows.ps1"
) else (
    REM Pass through all parameters
    powershell -ExecutionPolicy Bypass -File "%~dp0install-redis-windows.ps1" %*
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ Redis installation completed successfully!
) else (
    echo.
    echo ❌ Redis installation failed with error code %errorlevel%
)

echo.
echo Press any key to exit...
pause >nul 
