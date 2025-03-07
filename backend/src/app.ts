import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import videoRoutes from './routes/videoRoutes';
import omdbRoutes from './routes/omdbRoutes';
import scanRoutes from './routes/scanRoutes';

const app = express();

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use('/api', videoRoutes);
app.use('/api', omdbRoutes);
app.use('/api', scanRoutes);

export default app;