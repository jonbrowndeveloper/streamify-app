import { Request, Response } from 'express';
import AppSettings from '../models/AppSettings';

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const appSettings = await AppSettings.findOne();
    if (!appSettings) {
      return res.status(404).json({ error: 'App settings not found' });
    }
    res.status(200).json(appSettings);
  } catch (error) {
    if (error instanceof Error) {
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
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};