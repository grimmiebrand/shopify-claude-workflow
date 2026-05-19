// Centralised, validated env access. dotenv is loaded once in server.js.
'use strict';

function required(name) {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name, fallback = '') {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

module.exports = {
  port: Number(optional('PORT', '3000')),
  nodeEnv: optional('NODE_ENV', 'development'),
  logLevel: optional('LOG_LEVEL', 'info'),
  shopify: {
    webhookSecret: required('SHOPIFY_WEBHOOK_SECRET'),
    shopDomain: optional('SHOPIFY_SHOP_DOMAIN', ''),
  },
};
