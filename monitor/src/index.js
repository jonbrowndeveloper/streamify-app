const express = require('express');
const { exec } = require('child_process');
const cron = require('node-cron');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const treeKill = require('tree-kill');

const app = express();
const PORT = 4000;
const git = simpleGit();
const LOG_DIR = path.resolve(__dirname, '../logs');

// Create rotating write streams for backend and frontend logs
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
  return `[${timestamp}] ${message}`;
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

    // Stop the existing backend process if it exists
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

    // Restart the backend server
    const backendCommand = 'npm run start';
    console.log(logWithTimestamp(`Executing command: ${backendCommand}`));
    backendProcess = exec(`cmd /c ${backendCommand}`, {
      cwd: path.resolve(__dirname, '../../backend'),
      detached: true
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

    // Stop the existing frontend process if it exists
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

    // Restart the frontend server
    const frontendCommand = 'npm run start';
    console.log(logWithTimestamp(`Executing command: ${frontendCommand}`));
    frontendProcess = exec(`cmd /c ${frontendCommand}`, {
      cwd: path.resolve(__dirname, '../../frontend'),
      detached: true
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

app.get('/update', (req, res) => {
  const force = req.query.force === 'true';
  checkForUpdates(force)
    .then(() => res.status(200).send('Update process initiated.'))
    .catch((error) => res.status(500).send(`Error initiating update process: ${error.message}`));
});

app.get('/logs', (req, res) => {
  const app = req.query.app;
  const logFile = path.join(LOG_DIR, `${app}.log`);

  if (!fs.existsSync(logFile)) {
    return res.status(404).send('Log file not found');
  }

  fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading log file');
    }
    res.send(data);
  });
});

app.get('/start', (req, res) => {
  // Start PostgreSQL database using Docker Compose
  exec('docker-compose up -d', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error starting PostgreSQL: ${error.message}`));
      return res.status(500).send(`Error starting PostgreSQL: ${error.message}`);
    }
    console.log(logWithTimestamp(`PostgreSQL start stdout: ${stdout}`));
    console.error(logWithTimestamp(`PostgreSQL start stderr: ${stderr}`));

    // Start backend and frontend services
    updateBackend((backendError) => {
      if (!backendError) {
        updateFrontend((frontendError) => {
          if (!frontendError) {
            res.status(200).send('Services started successfully.');
          } else {
            res.status(500).send('Error starting frontend service.');
          }
        });
      } else {
        res.status(500).send('Error starting backend service.');
      }
    });
  });
});

app.get('/stop', (req, res) => {
  if (backendProcess) {
    treeKill(backendProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Failed to kill backend process: ${err.message}`);
      } else {
        console.log('Backend service stopped.');
      }
    });
    backendProcess = null;
  }

  if (frontendProcess) {
    treeKill(frontendProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Failed to kill frontend process: ${err.message}`);
      } else {
        console.log('Frontend service stopped.');
      }
    });
    frontendProcess = null;
  }

  exec('docker-compose down', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping PostgreSQL: ${error.message}`);
      return res.status(500).send(`Error stopping PostgreSQL: ${error.message}`);
    }
    console.log(`PostgreSQL stop stdout: ${stdout}`);
    console.error(`PostgreSQL stop stderr: ${stderr}`);
    res.status(200).send('Services stopped successfully.');
  });
});

app.listen(PORT, () => {
  console.log(`Monitor server is running on port ${PORT}`);
});

// Enable cron job if the flag is provided
if (process.argv.includes('--enable-cron')) {
  console.log('Cron job enabled.');
  // Schedule the cron job to run every 30 seconds
  cron.schedule('*/30 * * * * *', () => checkForUpdates());
}