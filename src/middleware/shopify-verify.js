// Verify the X-Shopify-Hmac-Sha256 header against the raw body using a
// timing-safe compare. Rejects the request with 401 on any mismatch.
'use strict';

const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

function timingSafeEqualB64(a, b) {
  const ab = Buffer.from(a, 'base64');
  const bb = Buffer.from(b, 'base64');
  if (ab.length !== bb.length) return false;
  try {
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

module.exports = function shopifyVerify(req, res, next) {
  const provided = req.get('x-shopify-hmac-sha256');
  if (!provided) {
    logger.warn('shopify.verify.missing_header', { path: req.path });
    return res.status(401).json({ error: 'missing_hmac' });
  }

  const raw = req.rawBody;
  if (!raw || raw.length === 0) {
    logger.warn('shopify.verify.empty_body', { path: req.path });
    return res.status(400).json({ error: 'empty_body' });
  }

  const expected = crypto
    .createHmac('sha256', env.shopify.webhookSecret)
    .update(raw)
    .digest('base64');

  if (!timingSafeEqualB64(expected, provided)) {
    logger.warn('shopify.verify.bad_signature', {
      path: req.path,
      shop: req.get('x-shopify-shop-domain') || null,
      topic: req.get('x-shopify-topic') || null,
    });
    return res.status(401).json({ error: 'invalid_hmac' });
  }

  // Useful metadata for downstream handlers.
  req.shopify = {
    topic: req.get('x-shopify-topic') || null,
    shop: req.get('x-shopify-shop-domain') || null,
    webhookId: req.get('x-shopify-webhook-id') || null,
    apiVersion: req.get('x-shopify-api-version') || null,
    triggeredAt: req.get('x-shopify-triggered-at') || null,
  };

  next();
};
