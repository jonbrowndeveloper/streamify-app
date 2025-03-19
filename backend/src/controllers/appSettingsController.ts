import { Request, Response } from 'express';
import AppSettings from '../models/AppSettings';
import logger from '../logger';

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    let appSettings = await AppSettings.findOne();
    if (!appSettings) {
      appSettings = await AppSettings.create({ videoBasePath: '/mnt/external_drive/Video/Movies' });
    }
    res.status(200).json(appSettings);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error fetching app settings:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const updateAppSettings = async (req: Request, res: Response) => {
  try {
    const { videoBasePath } = req.body;
    let appSettings = await AppSettings.findOne();
    if (!appSettings) {
      appSettings = await AppSettings.create({ videoBasePath });
    } else {
      appSettings.videoBasePath = videoBasePath;
      await appSettings.save();
    }
    res.status(200).json(appSettings);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error updating app settings:', error.message);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};