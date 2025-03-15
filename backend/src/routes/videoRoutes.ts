import { Router } from 'express';
import {
  createVideo,
  getVideoById,
  getAllVideos,
  updateVideo,
  deleteVideo,
  getVideoStream
} from '../controllers/videoController';

const router = Router();

router.post('/videos', createVideo);
router.get('/videos/:id', getVideoById);
router.get('/videos', getAllVideos);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);
router.get('/stream/:id', getVideoStream);

export default router;