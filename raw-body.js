// Capture the raw request body alongside the parsed JSON.
// Shopify HMAC verification requires the EXACT raw bytes — re-serialising
// the parsed JSON does not work because key order / whitespace differs.
'use strict';

const express = require('express');

module.exports = express.json({
  limit: '2mb',
  verify(req, _res, buf) {
    req.rawBody = buf; // Buffer
  },
});
