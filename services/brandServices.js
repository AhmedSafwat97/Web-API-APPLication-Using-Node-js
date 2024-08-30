const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const Category = require('../models/categoryModel'); 
const Product = require('../models/ProductModel');

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createBrand = asyncHandler(async (req, res) => {
  try {
    const { Name, categoryName } = req.body;

    // Check if the Name is provided
    if (!Name) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    // Find the category by its name
    const category = await Category.findOne({ Name: categoryName });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create the brand with the found category ID
    const brand = await Brand.create({
      Name,
      category: category._id // Use category ID here
    });

    res.status(201).json({ data: brand, message: 'Brand created successfully' });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brand name must be unique', details: error.message });
    }

    console.error('Error creating brand:', error);
    res.status(400).json({ error: 'Failed to create brand', details: error.message });
  }
});

// @desc    Get list of Brands
// @route   GET /api/v1/Brands
// @access  Public
exports.getBrands = asyncHandler(async (req, res) => {
    // Corrected model reference from `brand` to `Category`
    const Brands = await Brand.find({})
  
    res.status(200).json({ data: Brands });
  });
  
  // @desc    Get specific Brand by id
  // @route   GET /api/v1/brands/:id
  // @access  Public
  exports.getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    // Find the Brand by ID
    const brand = await Brand.findById(id).populate('category', 'Name'); // Populate the category field, only fetching the 'Name' field
  
    // If the Brand does not exist, return a 404 response
    if (!brand) {
      return res.status(404).json({ msg: "There is no Brand with this ID" });
    }
  
    // Find all products that belong to this brand using the brand ID
    const products = await Product.find({ brand: brand._id });
  
    // Send the Brand data along with the products
    res.status(200).json({
      data: {
        Name : brand.Name,
        category: brand.category.Name,
        products
      },
    });
  });


  // exports.getBrandsByCategoryName = asyncHandler(async (req, res) => {
  //   const { catid } = req.params;
  
  //   // Validate if the catid is a valid ObjectId
  //   if (!mongoose.Types.ObjectId.isValid(catid)) {
  //     return res.status(400).json({ msg: "Invalid Category ID" });
  //   }
  
  //   // Find the category by ID to ensure it exists
  //   const category = await Category.findById(catid);
  
  //   if (!category) {
  //     return res.status(404).json({ msg: "Category not found" });
  //   }
  
  //   // Find all brands that belong to this category
  //   const brands = await Brand.find({ category: catid });
  
  //   // Send the array of brands
  //   res.status(200).json(brands);
  // });