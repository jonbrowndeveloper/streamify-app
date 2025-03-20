const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { updateBackend, updateFrontend, checkForUpdates, logWithTimestamp, pipeWithTimestamp, backendLogStream, frontendLogStream, backendProcess, frontendProcess, treeKill, getSystemMetrics } = require('./utils');
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
      res.status(500).send('Error reading log file');
    }
    res.send(data);
  });
});

router.get('/clear-log', (req, res) => {
  const app = req.query.app;
  const logFile = path.join(LOG_DIR, `${app}.log`);

  if (!fs.existsSync(logFile)) {
    return res.status(404).send('Log file not found');
  }

  fs.writeFile(logFile, '', (err) => {
    if (err) {
      res.status(500).send('Error clearing log file');
    }
    res.status(200).send('Log file cleared successfully');
  });
});

router.get('/start-db', (req, res) => {
  exec('docker-compose up -d', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error starting PostgreSQL: ${error.message}`));
      return res.status(500).send(`Error starting PostgreSQL: ${error.message}`);
    }
    console.log(logWithTimestamp(`PostgreSQL start stdout: ${stdout}`));
    console.error(logWithTimestamp(`PostgreSQL start stderr: ${stderr}`));
    res.status(200).send('Database started successfully.');
  });
});

router.get('/start-backend', (req, res) => {
  updateBackend((backendError) => {
    if (!backendError) {
      res.status(200).send('Backend started successfully.');
    } else {
      res.status(500).send('Error starting backend service.');
    }
  });
});

router.get('/start-frontend', (req, res) => {
  updateFrontend((frontendError) => {
    if (!frontendError) {
      res.status(200).send('Frontend started successfully.');
    } else {
      res.status(500).send('Error starting frontend service.');
    }
  });
});

router.get('/stop-db', (req, res) => {
  exec('docker-compose down', { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(logWithTimestamp(`Error stopping PostgreSQL: ${error.message}`));
      return res.status(500).send(`Error stopping PostgreSQL: ${error.message}`);
    }
    console.log(logWithTimestamp(`PostgreSQL stop stdout: ${stdout}`));
    console.error(logWithTimestamp(`PostgreSQL stop stderr: ${stderr}`));
    res.status(200).send('Database stopped successfully.');
  });
});

router.get('/stop-backend', (req, res) => {
  if (backendProcess) {
    treeKill(backendProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Failed to kill backend process: ${err.message}`);
        return res.status(500).send(`Failed to kill backend process: ${err.message}`);
      } else {
        console.log('Backend service stopped.');
        backendProcess = null;
        res.status(200).send('Backend stopped successfully.');
      }
    });
  } else {
    res.status(200).send('Backend is not running.');
  }
});

router.get('/stop-frontend', (req, res) => {
  if (frontendProcess) {
    treeKill(frontendProcess.pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Failed to kill frontend process: ${err.message}`);
        return res.status(500).send(`Failed to kill frontend process: ${err.message}`);
      } else {
        console.log('Frontend service stopped.');
        frontendProcess = null;
        res.status(200).send('Frontend stopped successfully.');
      }
    });
  } else {
    res.status(200).send('Frontend is not running.');
  }
});

router.get('/stop-monitor', (req, res) => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
  res.status(200).send('Monitor will stop shortly.');
});

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).send(`Error fetching metrics: ${error.message}`);
  }
});

router.get('/api/health-check', (req, res) => {
  const app = req.query.app;
  if (app === 'backend' || app === 'frontend') {
    res.status(200).json({ status: 'healthy' });
  } else {
    res.status(400).json({ error: 'Invalid app specified' });
  }
});

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

module.exports = router;