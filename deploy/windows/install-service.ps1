#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Install Cockpit Vibe as a Windows Service

.DESCRIPTION
    This script installs Cockpit Vibe as a Windows service using WinSW.
    It also sets up the environment variables and creates necessary directories.

.PARAMETER EnvFile
    Path to the .env file (default: .env in app directory)

.EXAMPLE
    .\install-service.ps1
    .\install-service.ps1 -EnvFile "C:\config\cockpit-vibe.env"
#>

param(
    [string]$EnvFile = "..\..\.env"
)

$ErrorActionPreference = "Stop"

# Configuration
$ServiceName = "cockpit-vibe"
$AppDir = (Resolve-Path "$PSScriptRoot\..\..").Path
$WinswExe = "$PSScriptRoot\$ServiceName-service.exe"
$WinswXml = "$PSScriptRoot\$ServiceName-service.xml"

Write-Host "=== Cockpit Vibe Service Installer ===" -ForegroundColor Cyan
Write-Host ""

# Check if WinSW executable exists
if (-not (Test-Path $WinswExe)) {
    Write-Host "WinSW executable not found at: $WinswExe" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download WinSW from:" -ForegroundColor Yellow
    Write-Host "https://github.com/winsw/winsw/releases" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then rename the exe to: $ServiceName-service.exe" -ForegroundColor Yellow
    exit 1
}

# Check if XML config exists
if (-not (Test-Path $WinswXml)) {
    Write-Host "WinSW config not found at: $WinswXml" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
$nodeVersion = & node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check if dist folder exists
if (-not (Test-Path "$AppDir\dist\index.js")) {
    Write-Host "Application not built. Running build..." -ForegroundColor Yellow
    Push-Location $AppDir
    & pnpm build
    Pop-Location
}

# Create logs directory
$LogsDir = "$AppDir\logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
    Write-Host "Created logs directory: $LogsDir" -ForegroundColor Green
}

# Load environment variables from .env file
$EnvFilePath = Resolve-Path $EnvFile -ErrorAction SilentlyContinue
if ($EnvFilePath) {
    Write-Host "Loading environment from: $EnvFilePath" -ForegroundColor Green
    Get-Content $EnvFilePath | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Machine")
        }
    }
} else {
    Write-Host "No .env file found at: $EnvFile" -ForegroundColor Yellow
    Write-Host "Make sure to configure environment variables manually." -ForegroundColor Yellow
}

# Check if service already exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Service already exists. Stopping and removing..." -ForegroundColor Yellow
    & $WinswExe stop
    Start-Sleep -Seconds 2
    & $WinswExe uninstall
    Start-Sleep -Seconds 2
}

# Install the service
Write-Host "Installing service..." -ForegroundColor Cyan
& $WinswExe install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Installation Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Name: $ServiceName" -ForegroundColor White
    Write-Host "App Directory: $AppDir" -ForegroundColor White
    Write-Host "Logs Directory: $LogsDir" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  Start:   .\start-service.ps1" -ForegroundColor White
    Write-Host "  Stop:    .\stop-service.ps1" -ForegroundColor White
    Write-Host "  Status:  .\status-service.ps1" -ForegroundColor White
    Write-Host "  Logs:    Get-Content $LogsDir\cockpit-vibe.out.log -Tail 50" -ForegroundColor White
} else {
    Write-Host "Installation failed!" -ForegroundColor Red
    exit 1
}
