import { Router } from 'express';
import {
  createVideo,
  getVideoById,
  getAllVideos,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController';

const router = Router();

router.post('/videos', createVideo);
router.get('/videos/:id', getVideoById);
router.get('/videos', getAllVideos);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

export default router;