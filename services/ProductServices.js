const slugify = require("slugify");

const asyncHandler = require("express-async-handler");

const Product = require("../models/ProductModel");

const Category = require("../models/categoryModel");

const Brand = require("../models/brandModel");

const { formatDistanceToNow } = require("date-fns");

// // @desc    Create Product
// // @route   post  /api/v1/Product/
// // @access  Private
// // asyncHandler or try and catch or then catch
exports.createProduct = asyncHandler(async (req, res) => {
  try {
    const { Name,
       Description, 
       images, category 
       , price , brand ,
       bestseller , Rating ,
       Reviews , HasDiscount ,
       discount , PriceBeforeDiscount
      } = req.body;

    // Find the category by name and get its ObjectId
    const TargetCategory = await Category.findOne({ Name: category });
    if (!TargetCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const TargetBrand = await Brand.findOne({ Name: brand });
    if (!TargetBrand) {
      return res.status(404).json({ error: 'brand not found' });
    }

    // Create the Product
    const product = await Product.create({
      Name,
      Description,
      images,
      category: TargetCategory._id, // Use the ObjectId of the category
      price ,
      brand : TargetBrand._id,
      bestseller ,
      Rating ,
      Reviews ,
      HasDiscount ,
      discount ,
      PriceBeforeDiscount
    });

    // Respond with the newly created product
    res.status(201).json({ data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: 'Failed to create product', details: error.message });
  }
});

// @desc    Get list of Products
// @route   GET /api/v1/Products
// make pagination GET /api/v1/Products?page=1&limit=4
// to change category id in to category name we use populate
// @access  Public

exports.getProducts = asyncHandler(async (req, res) => {
  const PageNumber = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 6;
  const skip = (PageNumber - 1) * limit;
  const TotalProducts = await Product.countDocuments();
  const TotalPages = Math.ceil(TotalProducts / limit);

  // to filter the Products with category
  let filterProducts = {};
  if (req.params.categoryName) filterProducts = { category: req.params.categoryName };
  // ///////// here
  const Products = await Product.find(filterProducts)
    .skip(skip)
    .limit(limit)
    .populate({ path: "category", select: "name -_id" })
  res.status(200).json({ results: Products.length, TotalProducts , PageNumber , TotalPages ,data: Products });
});


// @desc    Get list of Products
// @route   GET /api/v1/Products
// make pagination GET /api/v1/Products?page=1&limit=4
// to change category id in to category name we use populate
// @access  Public
exports.FilterProducts = asyncHandler(async (req, res) => {
  try {
    const { name, categoryName, brandName, minPrice, maxPrice } = req.query;
    const PageNumber = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (PageNumber - 1) * limit;

    // Build the query object
    const query = {};

    // Search by product name
    if (name) {
      query.Name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
    }

    // Search by category
    if (categoryName) {
      const categories = await Category.find({ Name: { $regex: new RegExp(categoryName, 'i') } });
      const categoryIds = categories.map(category => category._id);
      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        // If no categories match, return an empty result set
        return res.status(200).json({ results: 0, TotalProducts: 0, PageNumber, TotalPages: 0, data: [] });
      }
    }

    // Search by brand
    if (brandName) {
      const brands = await Brand.find({ Name: { $regex: new RegExp(brandName, 'i') } });
      const brandIds = brands.map(brand => brand._id);
      if (brandIds.length > 0) {
        query.brand = { $in: brandIds };
      } else {
        // If no brands match, return an empty result set
        return res.status(200).json({ results: 0, TotalProducts: 0, PageNumber, TotalPages: 0, data: [] });
      }
    }

    // Search by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice); // Greater than or equal to minPrice
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice); // Less than or equal to maxPrice
      }
    }

    // Find total products matching the query for pagination
    const TotalProducts = await Product.countDocuments(query);
    const TotalPages = Math.ceil(TotalProducts / limit);

    // Use aggregation to randomly sort and limit the products
    const Products = await Product.aggregate([
      { $match: query },           // Match the products based on the query
      { $sample: { size: limit } }  // Randomly select `limit` products
    ])
    .exec(); // Execute the aggregation

    // Populate the category and brand fields
    const populatedProducts = await Product.populate(Products, [
      { path: 'category', select: 'Name -_id' },
      { path: 'brand', select: 'Name -_id' }
    ]);

    res.status(200).json({ 
      results: populatedProducts.length, 
      TotalProducts, 
      PageNumber, 
      TotalPages, 
      data: populatedProducts 
    });

  } catch (error) {
    res.status(400).json({ error: error.message, message: "Failed to get products" });
  }
});


// @desc    Get specific Product by id
// @route   GET /api/v1/Product/:id
// @access  Public

exports.getProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ msg: "There is no product with this ID" });
    }

    res.status(200).json({ data: product });
  } catch (error) {
    res.status(400).json({ error: error.message , message : "failed to get this product" });
  }
});


exports.getRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const { categoryName } = req.params; // Get categoryName from URL parameters
    
    const query = {};

    if (categoryName) {
      const categories = await Category.find({ Name: { $regex: new RegExp(categoryName, 'i') } });
      const categoryIds = categories.map(category => category._id);
      if (categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      } else {
        // If no categories match, return an empty result set
        return res.status(200).json({ data: [] });
      }
    }

    // Use aggregation to get a random sample of 4 related products
    const Products = await Product.aggregate([
      { $match: query },            // Match the products based on the category
      { $sample: { size: 4 } }       // Randomly select 4 products
    ])
    .exec(); // Execute the aggregation

    // Populate the category and brand fields
    const populatedProducts = await Product.populate(Products, [
      { path: 'category', select: 'Name -_id' },
      { path: 'brand', select: 'Name -_id' }
    ]);

    res.status(200).json({ 
      data: populatedProducts 
    });

  } catch (error) {
    res.status(400).json({ error: error.message, message: "Failed to get related products" });
  }
});


exports.getSaleProducts = asyncHandler(async (req, res) => {
  try {
    const PageNumber = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (PageNumber - 1) * limit;

    // Count total products that have a discount
    const TotalProducts = await Product.countDocuments({ HasDiscount: true });
    const TotalPages = Math.ceil(TotalProducts / limit);

    // Sample a larger number of products to ensure randomness
    const randomSampleSize = Math.min(TotalProducts, 100); // Adjust the sample size based on your needs

    // Use aggregation to get a random sample
    const randomProducts = await Product.aggregate([
      { $match: { HasDiscount: true } },
      { $sample: { size: randomSampleSize } } // Randomly select a sample of products
    ]);

    // Apply pagination to the randomly selected products
    const Products = randomProducts.slice(skip, skip + limit);

    res.status(200).json({
      results: Products.length,
      TotalProducts,
      PageNumber,
      TotalPages,
      data: Products
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message, message: "Failed to get products" });
  }
});



exports.getBestSellerProducts = asyncHandler(async (req, res) => {
  try {
    const PageNumber = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (PageNumber - 1) * limit;

    // Count total products that are bestsellers
    const TotalProducts = await Product.countDocuments({ bestseller: true });
    const TotalPages = Math.ceil(TotalProducts / limit);

    // Sample a larger number of products to ensure randomness
    const randomSampleSize = Math.min(TotalProducts, 100); // Adjust the sample size based on your needs

    // Use aggregation to get a random sample
    const randomProducts = await Product.aggregate([
      { $match: { bestseller: true } },
      { $sample: { size: randomSampleSize } } // Randomly select a sample of products
    ]);

    // Apply pagination to the randomly selected products
    const Products = randomProducts.slice(skip, skip + limit);

    res.status(200).json({
      results: Products.length,
      TotalProducts,
      PageNumber,
      TotalPages,
      data: Products
    });

  } catch (error) {
    res.status(400).json({ error: error.message, message: "Failed to get products" });
  }
});







// @desc    Update specific category
// @route   PUT /api/v1/Product/:id
// @access  Private

// exports.updateProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   // to create Product from this category (Nested route)
//   if (!req.body.category) req.body.category = req.params.categoryId;

//   if (req.file && req.file.filename) {
//     const filename = req.file.filename;

//     // Construct the image URL
//     const imageUrl = `uploads/${filename}`;

//     // Set the imageCover field to the imageUrl
//     req.body.imageCover = imageUrl;
//   }

//   req.body.slug = slugify(req.body.title);

//   const Product = await Product.findOneAndUpdate(
//     { _id: id },
//     req.body,
//     { new: true } //to return the after updateing
//   );

//   !Product
//     ? res.status(404).json({ msg: "there is no category for this id" })
//     : res.status(200).json({ data: Product });
// });


// // @desc    Delete specific category
// // @route   DELETE /api/v1/categories/:id
// // @access  Private

// exports.deleteProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const Product = await Product.findByIdAndDelete(id);

//   !Product
//     ? res.status(404).json({ msg: "there is no category for this id" })
//     : res.status(205).send();
// });
