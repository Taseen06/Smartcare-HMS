const { spawn } = require('child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let shuttingDown = false;

function startService(name, cwd) {
  const child = spawn(npmCommand, ['run', 'dev'], {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    for (const proc of children) {
      if (proc.pid && proc.pid !== child.pid) {
        proc.kill('SIGTERM');
      }
    }

    if (signal) {
      console.error(`${name} stopped with signal ${signal}`);
      process.exit(1);
    }

    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.error(`Failed to start ${name}:`, error.message);
    process.exit(1);
  });

  children.push(child);
}

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (child.pid) {
      child.kill(signal);
    }
  }

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startService('backend', 'backend');
startService('frontend', 'frontend');
