const express = require('express');
const http = require('http');
const cron = require('node-cron');
const simpleGit = require('simple-git');
const routes = require('./routes');
const { checkForUpdates, getSystemMetrics } = require('./utils');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 4000;
const git = simpleGit();

app.use(express.json());
app.use(routes);

io.on('connection', (socket) => {
  console.log('New client connected');

  const sendMetrics = async () => {
    const metrics = await getSystemMetrics();
    socket.emit('metrics', metrics);
  };

  const interval = setInterval(sendMetrics, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`Monitor server is running on port ${PORT}`);
});

if (process.argv.includes('--enable-cron')) {
  console.log('Cron job enabled.');
  cron.schedule('*/30 * * * * *', () => checkForUpdates());
}