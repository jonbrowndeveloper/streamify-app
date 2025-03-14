import { Router } from 'express';
import { getAppSettings, updateAppSettings } from '../controllers/appSettingsController';

const router = Router();

router.get('/app-settings', getAppSettings);
router.put('/app-settings', updateAppSettings);

export default router;