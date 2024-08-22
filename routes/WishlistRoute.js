const express = require('express');
const router = express.Router();
const { addToWishlist , getWishlistItems ,removeFromWishlist } = require('../services/WishlistServices'); // Update the path as necessary
// Define routes

router.route("/").get(getWishlistItems).post(addToWishlist)
.delete(removeFromWishlist);

module.exports = router;