// ============================================================
// Logger Middleware
// HTTP request logging using Morgan.
// Uses 'dev' format in development, 'combined' in production.
// ============================================================

import morgan from 'morgan';
import { env } from '../config/index.js';

const loggerMiddleware = morgan(env.isProduction ? 'combined' : 'dev');

export default loggerMiddleware;
