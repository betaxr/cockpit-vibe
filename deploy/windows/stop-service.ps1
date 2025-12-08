#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Stop the Cockpit Vibe Windows Service
#>

$ServiceName = "cockpit-vibe"
$WinswExe = "$PSScriptRoot\$ServiceName-service.exe"

Write-Host "Stopping $ServiceName service..." -ForegroundColor Cyan
& $WinswExe stop

Start-Sleep -Seconds 2

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
Write-Host "Service status: $($service.Status)" -ForegroundColor Green
