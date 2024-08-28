const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Wishlist = require('../models/WishlistModel');
const Product = require('../models/ProductModel');

// @desc    Add product to Wishlist
// @route   POST /api/v1/Wishlist/add
// @access  For Users
exports.addToWishlist = asyncHandler(async (req, res) => {
  // Extract token from the Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, token failed' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const productId = req.headers['productid'];

    // Validate input
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product's isFav field to true
    product.IsFav = true;
    await product.save();

    // Find or create the Wishlist for the user
    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Check if the product is already in the wishlist
    const existingItem = wishlist.items.find(item => item.product._id.toString() === productId);
    if (existingItem) {
      return res.status(200).json({ message: 'Product already in the wishlist' });
    }

    // Add the product to the wishlist
    wishlist.items.push({ product: productId });
    
    // Save the Wishlist
    await wishlist.save();

    // Respond with the updated Wishlist
    res.status(200).json({
      WishlistItems: wishlist,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// @desc    Get all wishlist items for a user
// @route   GET /api/v1/Wishlist
// @access  Private (Users only)
exports.getWishlistItems = asyncHandler(async (req, res) => {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  
    // Find the Wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
  
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found for this user' });
    }
  
    res.status(200).json({ data: wishlist });
  });
  
  // @desc    Remove a product from the wishlist
  // @route   DELETE /api/v1/Wishlist
  // @access  Private (Users only)
  exports.removeFromWishlist = asyncHandler(async (req, res) => {
    // Extract token from the Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  
    const productId = req.headers['productid'];
  
    // Validate input
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
  
    // Find the Wishlist for the user
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }
  
    // Remove the product from the Wishlist
    const initialItemCount = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => item.product._id.toString() !== productId);
  
    // Check if the product was found and removed
    if (wishlist.items.length === initialItemCount) {
      return res.status(404).json({ error: 'Product not found in Wishlist' });
    }
  
    // Save the updated Wishlist
    await wishlist.save();
  
    res.status(200).json({ data: wishlist, message: 'Product removed successfully' });
  });


