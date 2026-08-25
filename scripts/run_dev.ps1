# Run dev environment: backend (uvicorn) + frontend (vite)
# Usage: From repo root in PowerShell: .\scripts\run_dev.ps1

param()

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'
$pythonExe = Join-Path $backendDir '.venv\Scripts\python.exe'

# Activate python venv
$venv = Join-Path $PSScriptRoot '..\backend\.venv\Scripts\Activate.ps1'
if (Test-Path $venv) {
    Write-Host "Activating venv..."
    & $venv
} else {
    Write-Host "Virtual environment not found at $venv. Please create with: python -m venv backend/.venv" -ForegroundColor Yellow
}

# Ensure local sqlite DATABASE_URL unless user provided DATABASE_URL
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = 'sqlite:///./backend/dev.db'
    Write-Host "Using local SQLite DB: $env:DATABASE_URL"
} else {
    Write-Host "Using DATABASE_URL from environment: $env:DATABASE_URL"
}

# Blank AI keys by default (avoid init errors). Set your keys in backend/.env or env vars before running.
$env:CHATGPT_API_KEY = $env:CHATGPT_API_KEY
$env:OPENAI_API_KEY = $env:OPENAI_API_KEY
$env:GEMINI_API_KEY = $env:GEMINI_API_KEY

# Fail fast if the backend interpreter is missing so the port error is visible immediately.
if (-not (Test-Path $pythonExe)) {
    throw "Backend Python interpreter not found at $pythonExe. Create the venv with: python -m venv backend/.venv"
}

function Stop-StaleViteOnPort {
    param(
        [int]$Port
    )

    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $listener) {
        return
    }

    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
    if ($process -and $process.CommandLine -match 'vite\.js|node_modules\\\.bin\\.*vite') {
        Write-Host "Stopping stale Vite process on port $Port (PID $($listener.OwningProcess))..."
        Stop-Process -Id $listener.OwningProcess -Force
        return
    }

    throw "Port $Port is already in use by PID $($listener.OwningProcess). Stop that process or change the Vite port."
}

Stop-StaleViteOnPort -Port 5173

# Start backend in a background job
Write-Host "Starting backend (uvicorn)..."
Start-Job -Name SentinelBackend -ArgumentList $backendDir, $pythonExe, $env:DATABASE_URL -ScriptBlock {
    param($backendDir, $pythonExe, $databaseUrl)

    Set-Location $backendDir
    if ($databaseUrl) {
        $env:DATABASE_URL = $databaseUrl
    }

    & $pythonExe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} | Out-Null

# Start frontend in foreground
Write-Host "Starting frontend (vite)..."
Set-Location $frontendDir
Start-Process 'http://localhost:5173'
npm run dev -- --host

Write-Host "To stop backend job run: Get-Job -Name SentinelBackend | Stop-Job | Receive-Job" -ForegroundColor Cyan
