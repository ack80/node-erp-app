// src/config/logger.js

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Si estamos en producción filtramos logs de debug/info para ahorrar recursos
const currentLogLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.warn : LOG_LEVELS.debug;

/**
 * Función interna de formateo estructurado JSON.
 */
function log(level, message, context = {}) {
  if (LOG_LEVELS[level] < currentLogLevel) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...(Object.keys(context).length > 0 ? { context } : {}),
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

/**
 * Logger estructurado nativo (Zero-Dependencies)
 */
export const logger = {
  debug: (msg, ctx) => log('debug', msg, ctx),
  info:  (msg, ctx) => log('info', msg, ctx),
  warn:  (msg, ctx) => log('warn', msg, ctx),
  error: (msg, ctx) => log('error', msg, ctx),
};
