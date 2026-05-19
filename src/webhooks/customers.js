'use strict';

const express = require('express');
const rawBody = require('../middleware/raw-body');
const shopifyVerify = require('../middleware/shopify-verify');
const logger = require('../utils/logger');
const { handleCustomer } = require('./handlers');

const router = express.Router();

router.post('/', rawBody, shopifyVerify, async (req, res) => {
  const { topic, shop } = req.shopify;
  try {
    res.status(200).json({ ok: true });
    await handleCustomer({ topic, shop, payload: req.body, headers: req.headers });
  } catch (err) {
    logger.error('webhook.customers.handler_failed', {
      topic, shop, error: err && err.message,
    });
  }
});

module.exports = router;
