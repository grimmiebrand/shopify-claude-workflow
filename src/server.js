// Entry point. Loads env, sets up Express, mounts routes, starts the server.
'use strict';

require('dotenv').config();

const express = require('express');
const env = require('./config/env');
const logger = require('./utils/logger');
const health = require('./routes/health');
const webhooks = require('./webhooks');
const { notFound, errorHandler } = require('./middleware/error-handler');

const app = express();

// Trust Render's proxy so req.ip works correctly.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Root: tiny status page.
app.get('/', (_req, res) => {
  res.json({
    service: 'shopify-claude-workflow',
    status: 'ok',
    docs: 'POST signed Shopify webhooks to /webhooks/{orders,customers,products}',
  });
});

// Public routes.
app.use('/health', health);

// Webhook routes — each route applies raw-body + HMAC verify internally so
// the raw bytes are preserved (a global json parser would corrupt the HMAC).
app.use('/webhooks', webhooks);

// 404 + error handlers (must be last).
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  logger.info('server.listening', {
    port: env.port,
    nodeEnv: env.nodeEnv,
    shop: env.shopify.shopDomain || null,
  });
});

// Graceful shutdown.
function shutdown(signal) {
  logger.info('server.shutdown', { signal });
  server.close(() => process.exit(0));
  // Force-exit after 10s if connections linger.
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Surface unhandled errors instead of dying silently.
process.on('unhandledRejection', (reason) => {
  logger.error('process.unhandled_rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});
process.on('uncaughtException', (err) => {
  logger.error('process.uncaught_exception', { message: err.message, stack: err.stack });
  // Exit so Render restarts the process — safer than continuing in a bad state.
  process.exit(1);
});
