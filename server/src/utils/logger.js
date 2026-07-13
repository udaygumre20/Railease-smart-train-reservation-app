// ============================================================
// Logger Utility
// Simple, structured console logger with timestamps and
// log level prefixes. Can be replaced with Winston/Pino later.
// ============================================================

/**
 * Formats a log message with timestamp and level.
 * @param {string} level - Log level label.
 * @param {string} message - Log message.
 * @returns {string} Formatted log string.
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
  info: (message, ...args) => {
    console.log(formatMessage('INFO', message), ...args);
  },

  warn: (message, ...args) => {
    console.warn(formatMessage('WARN', message), ...args);
  },

  error: (message, ...args) => {
    console.error(formatMessage('ERROR', message), ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('DEBUG', message), ...args);
    }
  },
};

export default logger;
