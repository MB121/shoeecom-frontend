const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Product = require("../models/Product")
const { protect, admin } = require("../middleware/auth")
const upload = require("../middleware/upload")
const router = express.Router()

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("minPrice").optional().isFloat({ min: 0 }).withMessage("Min price must be non-negative"),
    query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Max price must be non-negative"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 12
      const skip = (page - 1) * limit

      // Build filter object
      const filter = { isActive: true }

      // Category filter
      if (req.query.category) {
        filter.category = req.query.category
      }

      // Subcategory filter
      if (req.query.subcategory) {
        filter.subcategory = req.query.subcategory
      }

      // Brand filter
      if (req.query.brand) {
        filter.brand = new RegExp(req.query.brand, "i")
      }

      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {}
        if (req.query.minPrice) filter.price.$gte = Number.parseFloat(req.query.minPrice)
        if (req.query.maxPrice) filter.price.$lte = Number.parseFloat(req.query.maxPrice)
      }

      // Search filter
      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Size filter
      if (req.query.size) {
        filter["sizes.size"] = req.query.size
      }

      // Color filter
      if (req.query.color) {
        filter["colors.name"] = new RegExp(req.query.color, "i")
      }

      // Featured filter
      if (req.query.featured === "true") {
        filter.isFeatured = true
      }

      // Build sort object
      const sort = {}
      switch (req.query.sortBy) {
        case "price-low":
          sort.price = 1
          break
        case "price-high":
          sort.price = -1
          break
        case "rating":
          sort["rating.average"] = -1
          break
        case "newest":
          sort.createdAt = -1
          break
        case "name":
          sort.name = 1
          break
        default:
          sort.createdAt = -1
      }

      // Execute query
      const products = await Product.find(filter)
        .select("-reviews") // Exclude reviews for performance
        .sort(sort)
        .skip(skip)
        .limit(limit)

      // Get total count for pagination
      const total = await Product.countDocuments(filter)

      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get products error:", error)
      res.status(500).json({ message: "Server error fetching products" })
    }
  },
)

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "reviews.user",
      select: "firstName lastName avatar",
    })

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Get product error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).json({ message: "Server error fetching product" })
  }
})

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  upload.array("images", 5),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").isIn(["men", "women", "kids", "sports", "casual", "formal"]).withMessage("Invalid category"),
    body("subcategory")
      .isIn([
        "sneakers",
        "boots",
        "sandals",
        "heels",
        "flats",
        "running",
        "basketball",
        "soccer",
        "dress-shoes",
        "loafers",
      ])
      .withMessage("Invalid subcategory"),
    body("brand").trim().notEmpty().withMessage("Brand is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const {
        name,
        description,
        price,
        originalPrice,
        category,
        subcategory,
        brand,
        sizes,
        colors,
        features,
        materials,
        weight,
        dimensions,
      } = req.body

      // Process uploaded images
      const images = req.files
        ? req.files.map((file, index) => ({
            url: `/uploads/products/${file.filename}`,
            alt: `${name} image ${index + 1}`,
            isPrimary: index === 0,
          }))
        : []

      // Parse JSON fields
      const parsedSizes = sizes ? JSON.parse(sizes) : []
      const parsedColors = colors ? JSON.parse(colors) : []
      const parsedFeatures = features ? JSON.parse(features) : []
      const parsedMaterials = materials ? JSON.parse(materials) : []
      const parsedDimensions = dimensions ? JSON.parse(dimensions) : {}

      const product = await Product.create({
        name,
        description,
        price,
        originalPrice,
        category,
        subcategory,
        brand,
        sizes: parsedSizes,
        colors: parsedColors,
        images,
        features: parsedFeatures,
        materials: parsedMaterials,
        weight,
        dimensions: parsedDimensions,
      })

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      })
    } catch (error) {
      console.error("Create product error:", error)
      res.status(500).json({ message: "Server error creating product" })
    }
  },
)

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", protect, admin, upload.array("images", 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      sizes,
      colors,
      features,
      materials,
      weight,
      dimensions,
      isActive,
      isFeatured,
    } = req.body

    // Update fields
    if (name) product.name = name
    if (description) product.description = description
    if (price) product.price = price
    if (originalPrice !== undefined) product.originalPrice = originalPrice
    if (category) product.category = category
    if (subcategory) product.subcategory = subcategory
    if (brand) product.brand = brand
    if (sizes) product.sizes = JSON.parse(sizes)
    if (colors) product.colors = JSON.parse(colors)
    if (features) product.features = JSON.parse(features)
    if (materials) product.materials = JSON.parse(materials)
    if (weight) product.weight = weight
    if (dimensions) product.dimensions = JSON.parse(dimensions)
    if (isActive !== undefined) product.isActive = isActive
    if (isFeatured !== undefined) product.isFeatured = isFeatured

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: `${product.name} image ${index + 1}`,
        isPrimary: product.images.length === 0 && index === 0,
      }))
      product.images.push(...newImages)
    }

    await product.save()

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Server error updating product" })
  }
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Soft delete - just mark as inactive
    product.isActive = false
    await product.save()

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error deleting product" })
  }
})

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post(
  "/:id/reviews",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const product = await Product.findById(req.params.id)

      if (!product) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find((review) => review.user.toString() === req.user.id)

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" })
      }

      const { rating, comment } = req.body

      // Add review
      product.reviews.push({
        user: req.user.id,
        rating,
        comment,
      })

      // Update product rating
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
      product.rating.average = totalRating / product.reviews.length
      product.rating.count = product.reviews.length

      await product.save()

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: product.reviews[product.reviews.length - 1],
      })
    } catch (error) {
      console.error("Add review error:", error)
      res.status(500).json({ message: "Server error adding review" })
    }
  },
)

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category")
    const subcategories = await Product.distinct("subcategory")
    const brands = await Product.distinct("brand")

    res.json({
      success: true,
      data: {
        categories,
        subcategories,
        brands,
      },
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Server error fetching categories" })
  }
})

module.exports = router
