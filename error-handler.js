'use strict';

const logger = require('../utils/logger');

// 404 handler — must be registered AFTER all routes.
function notFound(req, res, _next) {
  res.status(404).json({ error: 'not_found', path: req.path });
}

// Final error handler — Express recognises 4-arg signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  logger.error('express.unhandled_error', {
    path: req.path,
    method: req.method,
    message: err && err.message,
    stack: err && err.stack,
  });
  res.status(500).json({ error: 'internal_error' });
}

module.exports = { notFound, errorHandler };
