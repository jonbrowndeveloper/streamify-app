import { Router } from 'express';
import { getOmdbData } from '../controllers/omdbController';

const router = Router();

router.get('/getOMDBData', getOmdbData);

export default router;