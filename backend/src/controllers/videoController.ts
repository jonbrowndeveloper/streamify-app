import { Request, Response } from 'express';
import Video from '../models/Video';
import path from 'path';
import fs from 'fs';
import AppSettings from '../models/AppSettings';

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

export const getVideoStream = async (req: Request, res: Response) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const appSettings = await AppSettings.findOne();
    if (!appSettings) {
      return res.status(500).json({ error: 'App settings not found' });
    }

    const videoPath = path.resolve(appSettings.videoBasePath, video.filepath);
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found on local storage' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};