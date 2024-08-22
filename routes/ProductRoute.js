const express = require("express");

const { createProduct, getProducts , getProduct , FilterProducts , deleteProduct } = require("../services/ProductServices");

const router = express.Router({mergeParams : true});
router.route("/").get(FilterProducts).post(createProduct);
router.route('/:id').get(getProduct)
router.get("/", FilterProducts);


module.exports = router; 
