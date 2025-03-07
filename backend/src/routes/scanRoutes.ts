import { Router } from 'express';
import { scanAndInsertVideos } from '../services/videoService';

const router = Router();

router.post('/scan', async (req, res) => {
  try {
    const { totalVideosFound, totalVideosInserted, errors } = await scanAndInsertVideos();
    res.status(200).json({
      message: 'Videos scanned and inserted successfully',
      videosfound: totalVideosFound,
      videosInsertedToDB: totalVideosInserted,
      errors: errors
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

export default router;