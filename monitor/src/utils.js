const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const treeKill = require('tree-kill');
const systeminformation = require('systeminformation');

const LOG_DIR = path.resolve(__dirname, '../logs');

// Ensure the logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}


const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}\n`;
};

let backendProcess = null;
let frontendProcess = null;

const runCommand = (command, args, cwd) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: true });

    child.stdout.on('data', (data) => {
      console.log(logWithTimestamp(data.toString()));
    });

    child.stderr.on('data', (data) => {
      console.error(logWithTimestamp(data.toString()));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

const startBackend = async () => {
  const backendPath = path.resolve(__dirname, '../../backend');
  const backendLogFile = path.join(LOG_DIR, 'backend.log');
  const backendLogStream = fs.createWriteStream(backendLogFile, { flags: 'a' });

  try {
    console.log(logWithTimestamp('Starting backend...'));

    // Step 1: Install dependencies
    await runCommand('npm', ['install'], backendPath);

    // Step 2: Build the backend
    await runCommand('npm', ['run', 'build'], backendPath);

    // Step 3: Start the backend
    backendProcess = spawn('npm', ['run', 'start'], { cwd: backendPath, shell: true, detached: true });

    // Pipe stdout to log file with timestamps
    backendProcess.stdout.on('data', (data) => {
      const message = logWithTimestamp(data.toString());
      console.log(message);
      backendLogStream.write(message);
    });

    // Pipe stderr to log file with timestamps
    backendProcess.stderr.on('data', (data) => {
      const message = logWithTimestamp(data.toString());
      console.error(message);
      backendLogStream.write(message);
    });

    backendProcess.on('error', (error) => {
      const message = logWithTimestamp(`Failed to start backend process: ${error.message}`);
      console.error(message);
      backendLogStream.write(message);
    });

    backendProcess.on('close', (code) => {
      const message = logWithTimestamp(`Backend process exited with code ${code}`);
      console.log(message);
      backendLogStream.write(message);
      backendLogStream.end();
    });

    backendProcess.unref();
  } catch (error) {
    throw new Error(`Backend start failed: ${error.message}`);
  }
};

const startFrontend = async () => {
  const frontendPath = path.resolve(__dirname, '../../frontend');
  const frontendLogFile = path.join(LOG_DIR, 'frontend.log');
  const frontendLogStream = fs.createWriteStream(frontendLogFile, { flags: 'a' });

  try {
    console.log(logWithTimestamp('Starting frontend...'));

    // Step 1: Install dependencies
    await runCommand('npm', ['install'], frontendPath);

    // Step 2: Build the frontend
    await runCommand('npm', ['run', 'build'], frontendPath);

    // Step 3: Start the frontend
    frontendProcess = spawn('npm', ['run', 'start'], { cwd: frontendPath, shell: true, detached: true });

    // Pipe stdout to log file with timestamps
    frontendProcess.stdout.on('data', (data) => {
      const message = logWithTimestamp(data.toString());
      console.log(message);
      frontendLogStream.write(message);
    });

    // Pipe stderr to log file with timestamps
    frontendProcess.stderr.on('data', (data) => {
      const message = logWithTimestamp(data.toString());
      console.error(message);
      frontendLogStream.write(message);
    });

    frontendProcess.on('error', (error) => {
      const message = logWithTimestamp(`Failed to start frontend process: ${error.message}`);
      console.error(message);
      frontendLogStream.write(message);
    });

    frontendProcess.on('close', (code) => {
      const message = logWithTimestamp(`Frontend process exited with code ${code}`);
      console.log(message);
      frontendLogStream.write(message);
      frontendLogStream.end();
    });

    frontendProcess.unref();
  } catch (error) {
    throw new Error(`Frontend start failed: ${error.message}`);
  }
};

const gitPull = async (callback) => {
  try {
    console.log(logWithTimestamp('Checking for updates...'));
    await git.fetch();
    const status = await git.status();
    if (status.behind > 0) {
      console.log(logWithTimestamp('Updates available. Pulling changes...'));
      await git.pull();
      console.log(logWithTimestamp('Git pull completed successfully.'));
      callback(null);
    } else {
      console.log(logWithTimestamp('No updates available.'));
      callback(null);
    }
  } catch (error) {
    console.error(logWithTimestamp(`Error pulling updates: ${error.message}`));
    callback(error);
  }
};

const stop = async () => {
  console.log("Stopping all processes...");
  const killedProcesses = [];

  const killProcess = (process, name) => {
    return new Promise((resolve, reject) => {
      treeKill(process.pid, "SIGTERM", (err) => {
        if (err) {
          console.error(`Error stopping ${name} process: ${err.message}`);
          reject(err);
        } else {
          console.log(`${name} process PID: ${process.pid} stopped successfully.`);
          killedProcesses.push(`${name} process: ${process.pid}`);
          resolve();
        }
      });
    });
  };

  if (backendProcess) {
    try {
      console.log(`Stopping backend process PID: ${backendProcess.pid}`);
      await killProcess(backendProcess, "backend");
      backendProcess = null; // Clean up the reference
    } catch (error) {
      console.error(`Error stopping backend process: ${error.message}`);
    }
  } else {
    console.log("No backend process is running.");
  }

  if (frontendProcess) {
    try {
      console.log(`Stopping frontend process PID: ${frontendProcess.pid}`);
      await killProcess(frontendProcess, "frontend");
      frontendProcess = null; // Clean up the reference
    } catch (error) {
      console.error(`Error stopping frontend process: ${error.message}`);
    }
  } else {
    console.log("No frontend process is running.");
  }

  if (killedProcesses.length === 0) {
    console.log("No processes were running to stop.");
  }

  return killedProcesses;
};

const checkProcess = (process) => {
  if (process === 'frontend') {
    return (frontendProcess !== null && frontendProcess !== undefined) || false;
  } else if (process === 'backend') {
    return (backendProcess !== null && backendProcess !== undefined) || false;
  }
};


const getSystemMetrics = async () => {
  try {
    const cpu = await systeminformation.currentLoad();
    const mem = await systeminformation.mem();
    const fsSize = await systeminformation.fsSize();
    const diskIO = await systeminformation.disksIO();
    return { cpu, mem, fsSize, diskIO };
  } catch (error) {
    console.error(logWithTimestamp(`Error fetching system metrics: ${error.message}`));
    return { cpu: null, mem: null, fsSize: null, diskIO: null };
  }
};

module.exports = {
  startBackend,
  startFrontend,
  checkProcess,
  gitPull,
  stop,
  logWithTimestamp,
  treeKill,
  getSystemMetrics
};