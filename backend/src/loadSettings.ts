import fs from 'fs';
import path from 'path';

const loadSettings = () => {
  const env = process.env.NODE_ENV || 'development';
  const settingsPath = path.resolve(__dirname, '../settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

  if (!settings[env]) {
    throw new Error(`Settings for environment '${env}' not found in settings.json`);
  }

  Object.keys(settings[env]).forEach(key => {
    process.env[key] = settings[env][key];
  });
};

export default loadSettings;