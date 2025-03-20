import { Router } from 'express';
import { sequelize } from '../database';

const router = Router();

router.get('/health-check', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: (error as Error).message });
  }
});

export default router;