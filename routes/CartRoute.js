const express = require('express');
const router = express.Router();
const { addToCart , getCartItems ,removeFromCart, getOrderedItems } = require('../services/CartServices'); // Update the path as necessary
// Define routes

router.route("/").get(getCartItems).post(addToCart)
.delete(removeFromCart);

router.get("/ConfirmedOders", getOrderedItems);

module.exports = router;