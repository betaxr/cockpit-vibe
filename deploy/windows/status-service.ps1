<#
.SYNOPSIS
    Check the status of the Cockpit Vibe Windows Service
#>

$ServiceName = "cockpit-vibe"
$WinswExe = "$PSScriptRoot\$ServiceName-service.exe"

Write-Host "=== Cockpit Vibe Service Status ===" -ForegroundColor Cyan
Write-Host ""

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "Service Name:   $($service.Name)" -ForegroundColor White
    Write-Host "Display Name:   $($service.DisplayName)" -ForegroundColor White
    Write-Host "Status:         $($service.Status)" -ForegroundColor $(if ($service.Status -eq "Running") { "Green" } else { "Yellow" })
    Write-Host "Start Type:     $($service.StartType)" -ForegroundColor White
    Write-Host ""
    
    # Check if the app is responding
    if ($service.Status -eq "Running") {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/healthz" -TimeoutSec 5 -UseBasicParsing
            $health = $response.Content | ConvertFrom-Json
            Write-Host "Health Check:" -ForegroundColor Cyan
            Write-Host "  Status:   $($health.status)" -ForegroundColor $(if ($health.status -eq "healthy") { "Green" } else { "Yellow" })
            Write-Host "  Uptime:   $([math]::Round($health.uptime / 60, 2)) minutes" -ForegroundColor White
            Write-Host "  Database: $($health.checks.database.status)" -ForegroundColor White
        } catch {
            Write-Host "Health check failed: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Service not installed." -ForegroundColor Yellow
    Write-Host "Run install-service.ps1 to install." -ForegroundColor White
}

Write-Host ""
Write-Host "Log files: $PSScriptRoot\..\..\logs\" -ForegroundColor Gray
