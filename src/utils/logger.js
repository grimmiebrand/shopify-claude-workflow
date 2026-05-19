// Minimal structured JSON logger. Writes to stdout (Render-friendly).
'use strict';

const LEVEL_ORDER = { debug: 10, info: 20, warn: 30, error: 40 };

function buildLogger() {
  const threshold = LEVEL_ORDER[(process.env.LOG_LEVEL || 'info').toLowerCase()] || 20;

  function emit(level, msg, meta) {
    if (LEVEL_ORDER[level] < threshold) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...(meta && typeof meta === 'object' ? meta : {}),
    });
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }

  return {
    debug: (msg, meta) => emit('debug', msg, meta),
    info: (msg, meta) => emit('info', msg, meta),
    warn: (msg, meta) => emit('warn', msg, meta),
    error: (msg, meta) => emit('error', msg, meta),
  };
}

module.exports = buildLogger();
