const express = require("express");

const { createProduct, getProducts , getProduct , FilterProducts , deleteProduct, getRelatedProducts, getSaleProducts, getBestSellerProducts } = require("../services/ProductServices");

const router = express.Router({mergeParams : true});
router.route("/").get(FilterProducts).post(createProduct);
router.route('/:id').get(getProduct)
router.get("/", FilterProducts);
router.get("/related/:id", getRelatedProducts);
router.get("/sale/discount", getSaleProducts);
router.get("/best/seller", getBestSellerProducts);

module.exports = router; 
