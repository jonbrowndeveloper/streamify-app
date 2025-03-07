import { Request, Response } from 'express';
import Video from '../models/Video';

export const createVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (video) {
      res.status(200).json(video);
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.findAll();
    res.status(200).json(videos);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const [updated] = await Video.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedVideo = await Video.findByPk(req.params.id);
      res.status(200).json(updatedVideo);
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const deleted = await Video.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};