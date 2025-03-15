import { Router, Response } from 'express';
import { scanAndInsertVideos } from '../services/videoService';

const router = Router();

router.get('/scan', async (req, res: Response) => {
  const basePath = req.query.basePath as string || 'E:/Video/Movies';
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await scanAndInsertVideos(res, basePath);
  } catch (error) {
    if (error instanceof Error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'An unknown error occurred' })}\n\n`);
    }
    res.end();
  }
});

export default router;