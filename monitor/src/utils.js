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

const updateBackend = (callback) => {
  console.log(logWithTimestamp('Updating backend...'));
  exec('cd ../backend && npm install && npm run build', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error updating backend: ${error.message}`));
      callback(error);
      return;
    }
    console.log(logWithTimestamp(`Backend update stdout: ${stdout}`));
    console.error(logWithTimestamp(`Backend update stderr: ${stderr}`));

    if (backendProcess) {
      treeKill(backendProcess.pid, 'SIGKILL', (err) => {
        if (err) {
          console.error(logWithTimestamp(`Failed to kill backend process: ${err.message}`));
        } else {
          console.log(logWithTimestamp('Existing backend process stopped.'));
        }
      });
      backendProcess = null;
    }

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
};

const updateFrontend = (callback) => {
  console.log(logWithTimestamp('Updating frontend...'));
  exec('cd ../frontend && npm install && npm run build', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error updating frontend: ${error.message}`));
      callback(error);
      return;
    }
    console.log(logWithTimestamp(`Frontend update stdout: ${stdout}`));
    console.error(logWithTimestamp(`Frontend update stderr: ${stderr}`));

    if (frontendProcess) {
      treeKill(frontendProcess.pid, 'SIGKILL', (err) => {
        if (err) {
          console.error(logWithTimestamp(`Failed to kill frontend process: ${err.message}`));
        } else {
          console.log(logWithTimestamp('Existing frontend process stopped.'));
        }
      });
      frontendProcess = null;
    }

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
  updateBackend,
  updateFrontend,
  checkForUpdates,
  logWithTimestamp,
  pipeWithTimestamp,
  backendLogStream,
  frontendLogStream,
  backendProcess,
  frontendProcess,
  treeKill,
  getSystemMetrics
};