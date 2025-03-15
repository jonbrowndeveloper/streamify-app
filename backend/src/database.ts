import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import Video from './models/Video';
import AppSettings from './models/AppSettings';

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

const models = [Video, AppSettings];

models.forEach((model) => {
  model.initialize(sequelize);
});