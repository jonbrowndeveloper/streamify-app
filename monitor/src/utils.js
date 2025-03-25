const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const treeKill = require('tree-kill');
const systeminformation = require('systeminformation');

const LOG_DIR = path.resolve(__dirname, '../logs');

const backendLogStream = rfs.createStream('backend.log', {
  size: '10M', // Rotate every 10 megabytes
  interval: '1d', // Rotate daily
  path: LOG_DIR,
});

const frontendLogStream = rfs.createStream('frontend.log', {
  size: '10M', // Rotate every 10 megabytes
  interval: '1d', // Rotate daily
  path: LOG_DIR,
});

let backendProcess = null;
let frontendProcess = null;

const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}\n`;
};

const pipeWithTimestamp = (stream, logStream) => {
  stream.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        logStream.write(logWithTimestamp(line) + '\n');
      }
    });
  });
};

const startBackend = (callback) => {
  console.log(logWithTimestamp('Starting backend...'));

  exec('npm install', { cwd: path.resolve(__dirname, '../../backend'), shell: true }, (installError, installStdout, installStderr) => {
    if (installError) {
      console.error(logWithTimestamp(`Error installing backend dependencies: ${installError.message}`));
      callback(installError);
      return;
    }
    console.log(logWithTimestamp(`Backend install stdout: ${installStdout}`));
    console.error(logWithTimestamp(`Backend install stderr: ${installStderr}`));

    exec('npm run build', { cwd: path.resolve(__dirname, '../../backend'), shell: true }, (buildError, buildStdout, buildStderr) => {
      if (buildError) {
        console.error(logWithTimestamp(`Error building backend: ${buildError.message}`));
        callback(buildError);
        return;
      }
      console.log(logWithTimestamp(`Backend build stdout: ${buildStdout}`));
      console.error(logWithTimestamp(`Backend build stderr: ${buildStderr}`));

      const backendCommand = 'npm run start';
      console.log(logWithTimestamp(`Executing command: ${backendCommand}`));
      backendProcess = exec(backendCommand, {
        cwd: path.resolve(__dirname, '../../backend'),
        detached: true,
        shell: true
      });

      pipeWithTimestamp(backendProcess.stdout, backendLogStream);
      pipeWithTimestamp(backendProcess.stderr, backendLogStream);

      backendProcess.on('error', (err) => {
        console.error(logWithTimestamp(`Failed to start backend process: ${err.message}`));
      });

      backendProcess.unref();
      console.log(logWithTimestamp('Backend server started.'));
      callback(null);
    });
  });
};

const startFrontend = (callback) => {
  console.log(logWithTimestamp('Starting frontend...'));

  exec('npm install', { cwd: path.resolve(__dirname, '../../frontend'), shell: true }, (installError, installStdout, installStderr) => {
    if (installError) {
      console.error(logWithTimestamp(`Error installing frontend dependencies: ${installError.message}`));
      callback(installError);
      return;
    }
    console.log(logWithTimestamp(`Frontend install stdout: ${installStdout}`));
    console.error(logWithTimestamp(`Frontend install stderr: ${installStderr}`));

    exec('npm run build', { cwd: path.resolve(__dirname, '../../frontend'), shell: true }, (buildError, buildStdout, buildStderr) => {
      if (buildError) {
        console.error(logWithTimestamp(`Error building frontend: ${buildError.message}`));
        callback(buildError);
        return;
      }
      console.log(logWithTimestamp(`Frontend build stdout: ${buildStdout}`));
      console.error(logWithTimestamp(`Frontend build stderr: ${buildStderr}`));

      const frontendCommand = 'npm run start';
      console.log(logWithTimestamp(`Executing command: ${frontendCommand}`));
      frontendProcess = exec(frontendCommand, {
        cwd: path.resolve(__dirname, '../../frontend'),
        detached: true,
        shell: true
      });

      pipeWithTimestamp(frontendProcess.stdout, frontendLogStream);
      pipeWithTimestamp(frontendProcess.stderr, frontendLogStream);

      frontendProcess.on('error', (err) => {
        console.error(logWithTimestamp(`Failed to start frontend process: ${err.message}`));
      });

      frontendProcess.unref();
      console.log(logWithTimestamp('Frontend server started.'));
      callback(null);
    });
  });
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

const checkForUpdates = async (force = false) => {
    try {
      console.log(logWithTimestamp('Checking for updates at ' + new Date().toLocaleString()));
      // Fetch the latest changes from the remote repository
      await git.fetch();
  
      // Check if there are any new commits
      const status = await git.status();
      if (force || status.behind > 0) {
        console.log(logWithTimestamp('Updates available or force update requested. Pulling changes...'));
        
        // Pull the latest changes
        await git.pull();
  
        // Update backend and frontend
        updateBackend((backendError) => {
          if (!backendError) {
            updateFrontend((frontendError) => {
              if (!frontendError) {
                console.log(logWithTimestamp('Update completed successfully.'));
              }
            });
          }
        });
      } else {
        console.log(logWithTimestamp('No updates available.'));
      }
    } catch (error) {
      console.error(logWithTimestamp('Error checking for updates:', error));
    }
  };
  

const getSystemMetrics = async () => {
  const cpu = await systeminformation.currentLoad();
  const mem = await systeminformation.mem();
  const fsSize = await systeminformation.fsSize();
  const diskIO = await systeminformation.disksIO();
  return { cpu, mem, fsSize, diskIO };
};

module.exports = {
  startBackend,
  startFrontend,
  gitPull,
  logWithTimestamp,
  pipeWithTimestamp,
  backendLogStream,
  frontendLogStream,
  backendProcess,
  frontendProcess,
  treeKill,
  getSystemMetrics
};