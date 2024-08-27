const express = require("express");

const { createProduct, getProducts , getProduct , FilterProducts , deleteProduct, getRelatedProducts } = require("../services/ProductServices");

const router = express.Router({mergeParams : true});
router.route("/").get(FilterProducts).post(createProduct);
router.route('/:id').get(getProduct)
router.get("/", FilterProducts);
router.get("/related/:categoryName", getRelatedProducts);

module.exports = router; 
