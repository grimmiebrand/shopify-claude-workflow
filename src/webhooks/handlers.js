// Business-logic handlers for verified Shopify webhooks.
// Each handler receives ({ topic, shop, payload, headers }) and is awaited.
// Throw to signal failure — the route layer will return 500 and Shopify
// will retry per its standard retry policy.
'use strict';

const logger = require('../utils/logger');

async function handleOrder({ topic, shop, payload }) {
  // Example fields: id, name (e.g. "#1001"), total_price, customer, line_items
  logger.info('webhook.order', {
    topic,
    shop,
    orderId: payload.id,
    name: payload.name,
    total: payload.total_price,
    currency: payload.currency,
    lineItems: Array.isArray(payload.line_items) ? payload.line_items.length : 0,
  });
  // TODO: persist, notify, sync — your business logic goes here.
}

async function handleCustomer({ topic, shop, payload }) {
  logger.info('webhook.customer', {
    topic,
    shop,
    customerId: payload.id,
    email: payload.email,
    state: payload.state,
  });
  // TODO: business logic
}

async function handleProduct({ topic, shop, payload }) {
  logger.info('webhook.product', {
    topic,
    shop,
    productId: payload.id,
    handle: payload.handle,
    title: payload.title,
    status: payload.status,
    variants: Array.isArray(payload.variants) ? payload.variants.length : 0,
  });
  // TODO: business logic
}

module.exports = { handleOrder, handleCustomer, handleProduct };
