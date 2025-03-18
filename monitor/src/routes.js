const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { updateBackend, updateFrontend, logWithTimestamp, pipeWithTimestamp, backendLogStream, frontendLogStream, backendProcess, frontendProcess, treeKill, getSystemMetrics } = require('./utils');
const systeminformation = require('systeminformation');

const router = express.Router();
const LOG_DIR = path.resolve(__dirname, '../logs');

router.get('/update', (req, res) => {
  const force = req.query.force === 'true';
  checkForUpdates(force)
    .then(() => res.status(200).send('Update process initiated.'))
    .catch((error) => res.status(500).send(`Error initiating update process: ${error.message}`));
});

router.get('/logs', (req, res) => {
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

router.get('/start', (req, res) => {
  exec('docker-compose up -d', { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error starting PostgreSQL: ${error.message}`));
      return res.status(500).send(`Error starting PostgreSQL: ${error.message}`);
    }
    console.log(logWithTimestamp(`PostgreSQL start stdout: ${stdout}`));
    console.error(logWithTimestamp(`PostgreSQL start stderr: ${stderr}`));

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

router.get('/stop', (req, res) => {
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

  exec('docker-compose down', { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping PostgreSQL: ${error.message}`);
      return res.status(500).send(`Error stopping PostgreSQL: ${error.message}`);
    }
    console.log(`PostgreSQL stop stdout: ${stdout}`);
    console.error(`PostgreSQL stop stderr: ${stderr}`);
    res.status(200).send('Services stopped successfully.');
  });
});

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).send(`Error fetching metrics: ${error.message}`);
  }
});

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

module.exports = router;