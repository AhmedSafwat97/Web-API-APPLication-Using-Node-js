const mongoose = require('mongoose');

// Define the ConfirmedCart schema
const confirmedCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required'],
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
      },
    },
  ],
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the ConfirmedCart model
const ConfirmedCart = mongoose.model('ConfirmedCart', confirmedCartSchema);

module.exports = ConfirmedCart;