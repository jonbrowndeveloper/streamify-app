import loadSettings from './loadSettings';
loadSettings();

import app from './app';
import { sequelize } from './database';

const PORT = parseInt(process.env.PORT as string, 10) || 5000;

const startServer = async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
};

startServer();