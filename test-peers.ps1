# Run separate Electron instances with isolated user data for P2P testing
# Usage: .\test-peers.ps1 [instance_number]
# Example: .\test-peers.ps1 1   # Starts peer instance 1
#          .\test-peers.ps1 2   # Starts peer instance 2 (run in another terminal)

param(
    [Parameter(Mandatory=$true)]
    [int]$Instance
)

$projectRoot = $PSScriptRoot
$userData = "$projectRoot\.test-peers\peer$Instance"

Write-Host "🚀 Starting Peer Instance $Instance" -ForegroundColor Cyan
Write-Host "📁 User Data Dir: $userData" -ForegroundColor Gray

# Ensure directory exists
if (!(Test-Path $userData)) {
    New-Item -ItemType Directory -Path $userData -Force | Out-Null
    Write-Host "📂 Created new user data directory" -ForegroundColor Green
}

# Build first just in case
Write-Host "🔧 Building Electron main process..." -ForegroundColor Yellow
npm run build:electron 2>&1 | Out-Null

# Run Electron with isolated user data
Write-Host "⚡ Launching Electron with isolated sandbox..." -ForegroundColor Green
npx electron . --user-data-dir="$userData"
