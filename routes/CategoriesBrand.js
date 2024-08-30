const express = require('express');
const {
  getBrandsByCategoryName,
} = require('../services/categoriesBrands');

const router = express.Router();
router.route('/:catid').get(getBrandsByCategoryName)

module.exports = router;