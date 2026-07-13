// ============================================================
// Database Configuration
// Exports database connection settings from environment.
// ============================================================

import env from './env.js';

const databaseConfig = {
  url: env.databaseUrl,
};

export default databaseConfig;
