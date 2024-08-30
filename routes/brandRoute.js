const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
  getBrandsByCategoryName,
} = require('../services/brandServices');

const router = express.Router();

const productRoutes = require('./ProductRoute.js');

// Brand routes
router.route('/').get(getBrands).post(createBrand);
router.route('/:id').get(getBrand)

module.exports = router;