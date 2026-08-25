import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = 5173;
const backendPort = 8000;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const backendDir = path.join(repoRoot, 'backend');
const backendPython = path.join(
  backendDir,
  '.venv',
  process.platform === 'win32' ? 'Scripts' : 'bin',
  process.platform === 'win32' ? 'python.exe' : 'python',
);
const viteEntryPoint = path.join(
  scriptDir,
  '..',
  'node_modules',
  'vite',
  'bin',
  'vite.js',
);

function getOwningProcessId(targetPort) {
  try {
    const output = execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess`,
    ], { encoding: 'utf8' }).trim();

    if (!output) {
      return null;
    }

    const parsed = Number.parseInt(output, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

function isViteProcess(pid) {
  try {
    const commandLine = execFileSync('powershell', [
      '-NoProfile',
      '-Command',
      `Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}" | Select-Object -ExpandProperty CommandLine`,
    ], { encoding: 'utf8' }).trim();

    return /vite\.js|node_modules\\\.bin\\.*vite/i.test(commandLine);
  } catch {
    return false;
  }
}

function stopProcess(pid) {
  execFileSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForHealth(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return true;
      }
    } catch {
      // keep polling until the backend is ready
    }

    await sleep(300);
  }

  return false;
}

async function startBackendIfNeeded() {
  try {
    const response = await fetch(`http://127.0.0.1:${backendPort}/health`, { cache: 'no-store' });
    if (response.ok) {
      return null;
    }
  } catch {
    // backend is not up yet
  }

  const backendOwningProcessId = getOwningProcessId(backendPort);
  if (backendOwningProcessId) {
    console.log(`Backend port ${backendPort} is already in use (PID ${backendOwningProcessId}).`);
    return null;
  }

  if (!path.isAbsolute(backendPython)) {
    throw new Error('Unable to resolve backend Python executable.');
  }

  if (!spawnSyncExists(backendPython)) {
    throw new Error(`Backend Python executable not found: ${backendPython}`);
  }

  console.log(`Starting backend on port ${backendPort}...`);
  const backendProcess = spawn(backendPython, ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', String(backendPort)], {
    cwd: backendDir,
    stdio: 'inherit',
  });

  const ready = await waitForHealth(`http://127.0.0.1:${backendPort}/health`);
  if (!ready) {
    backendProcess.kill();
    throw new Error(`Backend did not become healthy on port ${backendPort}.`);
  }

  return backendProcess;
}

function spawnSyncExists(executablePath) {
  try {
    execFileSync(executablePath, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const owningProcessId = getOwningProcessId(port);
  if (owningProcessId && isViteProcess(owningProcessId)) {
    console.log(`Stopping stale Vite process on port ${port} (PID ${owningProcessId})...`);
    stopProcess(owningProcessId);
  }

  const backendProcess = await startBackendIfNeeded();

  const child = spawn(process.execPath, [viteEntryPoint, '--host', '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
  });

  const cleanup = () => {
    if (backendProcess && !backendProcess.killed) {
      backendProcess.kill();
    }
  };

  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  child.on('exit', (code, signal) => {
    cleanup();
    if (signal) {
      process.exit(1);
    }

    process.exit(code ?? 0);
  });
}

await main();