
const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const Category = require('../models/categoryModel'); 

exports.getBrandsByCategoryName = asyncHandler(async (req, res) => {
    try {
        const { catid } = req.params;
    
    
        // Find the category by ID to ensure it exists
        const category = await Category.findById(catid);
    
        if (!category) {
          return res.status(404).json({ msg: "Category not found" });
        }
    
        // Find all brands that belong to this category
        const brands = await Brand.find({ category: catid });
    
        // Send the array of brands
        res.status(200).json(brands);
    
      } catch (error) {
        console.error('Error in getBrandsByCategoryName:', error);
        res.status(500).json({ error: error.message });
      }
  });
