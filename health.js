'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'shopify-claude-workflow',
    uptimeSeconds: Math.round(process.uptime()),
    now: new Date().toISOString(),
  });
});

module.exports = router;
