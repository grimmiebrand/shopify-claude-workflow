# Shopify ↔ Claude Code Workflow

Internal-only Express server that receives signed Shopify webhooks and gives Claude Code a safe surface to work with.

## Routes
- POST /webhooks/orders
- POST /webhooks/customers
- POST /webhooks/products
- GET /health

## Run locally
```bash
cp .env.example .env
# Edit .env and set SHOPIFY_WEBHOOK_SECRET
npm install
npm start
```

## Deploy
Render Blueprint — point at this repo, done.

## HMAC
Every webhook is verified against X-Shopify-Hmac-Sha256 before processing.
