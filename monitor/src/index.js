const express = require('express');
const { exec, spawn } = require('child_process');
const cron = require('node-cron');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const git = simpleGit();
const LOG_DIR = path.resolve(__dirname, '../logs');
const NPX_PATH = path.resolve(__dirname, '../../node_modules/.bin/npx');

let backendProcess = null;
let frontendProcess = null;

const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}`;
};

const updateBackend = (callback) => {
  console.log(logWithTimestamp('Updating backend...'));
  exec('cd ../backend && npm install && npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error updating backend: ${error.message}`));
      callback(error);
      return;
    }
    console.log(logWithTimestamp(`Backend update stdout: ${stdout}`));
    console.error(logWithTimestamp(`Backend update stderr: ${stderr}`));

    // Stop the existing backend process if it exists
    if (backendProcess) {
      process.kill(-backendProcess.pid);
      backendProcess = null;
      console.log(logWithTimestamp('Existing backend process stopped.'));
    }

    // Restart the backend server
    backendProcess = spawn('npm', ['run', 'start'], {
      cwd: path.resolve(__dirname, '../backend'),
      stdio: ['ignore', fs.openSync(path.join(LOG_DIR, 'backend.log'), 'a'), fs.openSync(path.join(LOG_DIR, 'backend.log'), 'a')],
      detached: true
    });
    backendProcess.unref();
    console.log(logWithTimestamp('Backend server started.'));
    callback(null);
  });
};

const updateFrontend = (callback) => {
  console.log(logWithTimestamp('Updating frontend...'));
  exec('cd ../frontend && npm install && npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error updating frontend: ${error.message}`));
      callback(error);
      return;
    }
    console.log(logWithTimestamp(`Frontend update stdout: ${stdout}`));
    console.error(logWithTimestamp(`Frontend update stderr: ${stderr}`));

    // Stop the existing frontend process if it exists
    if (frontendProcess) {
      process.kill(-frontendProcess.pid);
      frontendProcess = null;
      console.log(logWithTimestamp('Existing frontend process stopped.'));
    }

    // Restart the frontend server
    frontendProcess = spawn('npm', ['run', 'start'], {
      cwd: path.resolve(__dirname, '../frontend'),
      stdio: ['ignore', fs.openSync(path.join(LOG_DIR, 'frontend.log'), 'a'), fs.openSync(path.join(LOG_DIR, 'frontend.log'), 'a')],
      detached: true
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

// Schedule the cron job to run every 30 seconds
cron.schedule('*/30 * * * * *', () => checkForUpdates());

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
  exec('docker-compose up -d', (error, stdout, stderr) => {
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
    process.kill(-backendProcess.pid);
    backendProcess = null;
    console.log(logWithTimestamp('Backend service stopped.'));
  }

  if (frontendProcess) {
    process.kill(-frontendProcess.pid);
    frontendProcess = null;
    console.log(logWithTimestamp('Frontend service stopped.'));
  }

  exec('docker-compose down', (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error stopping PostgreSQL: ${error.message}`));
      return res.status(500).send(`Error stopping PostgreSQL: ${error.message}`);
    }
    console.log(logWithTimestamp(`PostgreSQL stop stdout: ${stdout}`));
    console.error(logWithTimestamp(`PostgreSQL stop stderr: ${stderr}`));
    res.status(200).send('Services stopped successfully.');
  });
});

app.listen(PORT, () => {
  console.log(logWithTimestamp(`Monitor server is running on port ${PORT}`));
});