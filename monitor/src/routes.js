const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { startBackend, startFrontend, checkProcess, gitPull, stop, logWithTimestamp, getSystemMetrics } = require('./utils');
const systeminformation = require('systeminformation');

const router = express.Router();
const LOG_DIR = path.resolve(__dirname, '../logs');

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

router.get('/start-backend', async (req, res) => {
  try {
    await startBackend();
    res.status(200).send('Backend started successfully.');
  } catch (error) {
    console.error(logWithTimestamp(`Error starting backend: ${error.message}`));
    res.status(500).send(`Error starting backend: ${error.message}`);
  }
});

router.get('/start-frontend', async (req, res) => {
  try {
    await startFrontend();
    res.status(200).send('Frontend started successfully.');
  } catch (error) {
    console.error(logWithTimestamp(`Error starting frontend: ${error.message}`));
    res.status(500).send(`Error starting frontend: ${error.message}`);
  }
});

router.get('/git-pull', (req, res) => {
  gitPull((gitError) => {
    if (!gitError) {
      res.status(200).send('Git pull completed successfully.');
    } else {
      res.status(500).send(`Error pulling updates: ${gitError.message}`);
    }
  });
});

router.get('/stop', async (req, res) => {
  try {
    const processes = await stop();
    if (processes.length === 0) {
      return res.status(404).send('No processes running to stop.');
    }
    res.send(`All processes stopped.\nProcesses: ${processes.join(', ')}`);
  } catch (error) {
    res.status(500).send(`Error stopping processes: ${error.message}`);
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
    console.log(logWithTimestamp('Fetching system metrics...'));
    const metrics = await getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    console.error(logWithTimestamp(`Error in /metrics route: ${error.message}`));
    res.status(500).send(`Error fetching metrics: ${error.message}`);
  }
});

router.get('/status-backend', (req, res) => {
  const process = checkProcess('backend');
  res.json({ running: process });
});

router.get('/status-frontend', (req, res) => {
  res.json({ running: checkProcess('frontend') });
});

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

module.exports = router;