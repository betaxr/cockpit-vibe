# Prepares WinSW config to run Cockpit Vibe as a Windows service.
# Usage: pwsh ./scripts/win-service/prepare-win-service.ps1 -ServiceName "CockpitVibe"

[CmdletBinding()]
param(
  [string]$ServiceName = "CockpitVibe",
  [string]$DisplayName = "Cockpit Vibe",
  [string]$Description = "Cockpit Vibe Node Service",
  [string]$NodePath = "node",
  [string]$WorkingDir = (Resolve-Path "$PSScriptRoot/../../"),
  [string]$EnvFile = ".env",
  [int]$Port = 3000,
  [string]$Host = "0.0.0.0",
  [string]$WinswExe = "winsw.exe"
)

Write-Host "Preparing WinSW config in $WorkingDir/deploy/win-service" -ForegroundColor Cyan

$distPath = Join-Path $WorkingDir "dist/index.js"
if (-not (Test-Path $distPath)) {
  Write-Warning "dist/index.js not found. Run 'pnpm build' first."
}

$outDir = Join-Path $WorkingDir "deploy/win-service"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$xmlPath = Join-Path $outDir "$ServiceName.xml"
$logDir = Join-Path $outDir "logs"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$xml = @"
<service>
  <id>$ServiceName</id>
  <name>$DisplayName</name>
  <description>$Description</description>
  <executable>$NodePath</executable>
  <arguments>`"$distPath`"</arguments>
  <logpath>%BASE%/logs</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10485760</sizeThreshold>
    <keepFiles>5</keepFiles>
  </log>
  <workingdirectory>$WorkingDir</workingdirectory>
  <env name="NODE_ENV" value="production" />
  <env name="PORT" value="$Port" />
  <env name="HOST" value="$Host" />
  <!-- Add more env entries here or edit .env copy below -->
  <stoptimeout>15sec</stoptimeout>
</service>
"@

Set-Content -Path $xmlPath -Value $xml -Encoding UTF8

# Copy .env for reference (WinSW does not auto-read .env; this is just a convenience copy)
if (Test-Path (Join-Path $WorkingDir $EnvFile)) {
  Copy-Item (Join-Path $WorkingDir $EnvFile) (Join-Path $outDir $EnvFile) -Force
  Write-Host "Copied $EnvFile into win-service folder (manual env entries still needed in XML)." -ForegroundColor Yellow
}

# Instructions
$instructions = @"
WinSW config generated:
  - Config: $xmlPath
  - Logs:   $logDir

Next steps (manual):
  1) Download WinSW (https://github.com/winsw/winsw) and place $WinswExe next to the XML.
  2) Open $xmlPath and add any extra <env> entries you need (DB, secrets).
  3) Install the service (from $outDir):
       .\${WinswExe} install
       .\${WinswExe} start
  4) To stop/remove:
       .\${WinswExe} stop
       .\${WinswExe} uninstall

Ensure Node is on PATH or set -NodePath to an absolute node.exe path.
"@

Set-Content -Path (Join-Path $outDir "README.txt") -Value $instructions -Encoding UTF8

Write-Host "Done. WinSW assets are in $outDir." -ForegroundColor Green
