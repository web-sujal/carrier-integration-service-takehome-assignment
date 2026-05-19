import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/config';
import { errorHandler } from './middlewares/error.middleware';
import { v1Router } from './routes/v1/index';
import { sendData } from './utils/apiSuccess';

const app = express();

app.use(helmet());

app.use(morgan(config.server.nodeEnv === 'production' ? 'combined' : 'dev'));

// CORS: allow explicit origins from CORS_ORIGINS, or "*" = allow all, or in dev with no env = allow all.
const allowAllOrigins =
  config.cors.origins.length === 0 ||
  (config.cors.origins.length === 1 && config.cors.origins[0] === '*');

const corsOrigin = allowAllOrigins
  ? true
  : config.cors.origins.map((o) => o.replace(/\/$/, '')); // strip trailing slash

app.use(
  cors({
    origin: corsOrigin,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.get('/health', (_req, res) => {
  return sendData(res, { status: 'ok', message: 'Server is running' });
});

app.use('/api/v1', v1Router);

app.use(errorHandler);

async function bootstrap() {
  app.listen(config.server.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.server.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
