// ============================================================
// Express Application Setup
// Configures middleware stack and mounts all routes.
// This file exports the configured Express app – it does NOT
// start the server (that's server.js).
// ============================================================

import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/index.js';
import loggerMiddleware from './middleware/logger.middleware.js';
import routes from './routes/index.js';
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';

const app = express();

// ── Security Middleware ─────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ── Request Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── HTTP Request Logging ────────────────────────────────────
app.use(loggerMiddleware);

// ── Health Check ────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'RailEase API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Error Handling (must be LAST) ───────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
