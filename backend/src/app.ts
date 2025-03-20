import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import videoRoutes from './routes/videoRoutes';
import omdbRoutes from './routes/omdbRoutes';
import scanRoutes from './routes/scanRoutes';
import appSettingsRoutes from './routes/appSettingsRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes';
import logger from './logger';

const app = express();

app.use(cors({
  origin: '*',
}));
app.use(bodyParser.json());

app.use('/api', videoRoutes);
app.use('/api', omdbRoutes);
app.use('/api', scanRoutes);
app.use('/api', appSettingsRoutes);
app.use('/api', healthCheckRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

export default app;