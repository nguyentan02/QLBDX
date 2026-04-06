import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ message: 'Parking Management API' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
