const mongoose = require('mongoose');

// Define the schema for brand
const brandSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true, // Ensure uniqueness if needed
    },
    image: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Brand must belong to a category'],
    }
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create the model for brand
const BrandModel = mongoose.model('Brand', brandSchema);

module.exports = BrandModel;