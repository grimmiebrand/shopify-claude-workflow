'use strict';

const express = require('express');
const orders = require('./orders');
const customers = require('./customers');
const products = require('./products');

const router = express.Router();
router.use('/orders', orders);
router.use('/customers', customers);
router.use('/products', products);

module.exports = router;
