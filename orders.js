'use strict';

const express = require('express');
const rawBody = require('../middleware/raw-body');
const shopifyVerify = require('../middleware/shopify-verify');
const logger = require('../utils/logger');
const { handleOrder } = require('./handlers');

const router = express.Router();

// POST /webhooks/orders  (catch-all for any orders/* topic)
router.post('/', rawBody, shopifyVerify, async (req, res) => {
  const { topic, shop } = req.shopify;
  try {
    // Acknowledge fast (Shopify expects a 200 within 5 seconds).
    res.status(200).json({ ok: true });

    // Run the handler AFTER the ack so a slow handler doesn't cause a retry.
    await handleOrder({ topic, shop, payload: req.body, headers: req.headers });
  } catch (err) {
    logger.error('webhook.orders.handler_failed', {
      topic, shop, error: err && err.message,
    });
  }
});

module.exports = router;
