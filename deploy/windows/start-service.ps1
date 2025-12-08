#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Start the Cockpit Vibe Windows Service
#>

$ServiceName = "cockpit-vibe"
$WinswExe = "$PSScriptRoot\$ServiceName-service.exe"

Write-Host "Starting $ServiceName service..." -ForegroundColor Cyan
& $WinswExe start

Start-Sleep -Seconds 2

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service.Status -eq "Running") {
    Write-Host "Service started successfully!" -ForegroundColor Green
    Write-Host "Access the application at: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host "Service status: $($service.Status)" -ForegroundColor Yellow
    Write-Host "Check logs at: $PSScriptRoot\..\..\logs\" -ForegroundColor Yellow
}
