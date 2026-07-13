// ============================================================
// Environment Variable Configuration
// Loads and validates all required environment variables.
// ============================================================

import dotenv from 'dotenv';

dotenv.config();

/**
 * Validated environment configuration object.
 * Throws on startup if critical variables are missing.
 */
const env = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '7d',

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

// ── Validate critical environment variables ──────────────────
const requiredVars = [
  ['DATABASE_URL', env.databaseUrl],
  ['JWT_ACCESS_SECRET', env.jwtAccessSecret],
  ['JWT_REFRESH_SECRET', env.jwtRefreshSecret],
];

const missing = requiredVars
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables:\n${missing.map((v) => `   - ${v}`).join('\n')}`
  );
  console.error('   → Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

export default Object.freeze(env);
