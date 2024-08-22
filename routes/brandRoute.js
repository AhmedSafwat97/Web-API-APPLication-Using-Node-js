const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
} = require('../services/brandServices');

const router = express.Router();

const productRoutes = require('./ProductRoute.js');

// Brand routes
router.route('/').get(getBrands).post(createBrand);
router.route('/:id').get(getBrand)

// // Nested product routes within a brand
// router.use('/:brandId/products', productRoutes);

module.exports = router;