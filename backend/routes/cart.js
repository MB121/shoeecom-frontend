const express = require("express")
const { body, validationResult } = require("express-validator")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { protect } = require("../middleware/auth")
const router = express.Router()

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images brand category sizes colors isActive",
    })

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] })
    }

    // Filter out inactive products
    cart.items = cart.items.filter((item) => item.product && item.product.isActive)
    await cart.save()

    res.json({
      success: true,
      data: cart,
    })
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(500).json({ message: "Server error fetching cart" })
  }
})

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post(
  "/items",
  protect,
  [
    body("productId").isMongoId().withMessage("Valid product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("size").trim().notEmpty().withMessage("Size is required"),
    body("color").trim().notEmpty().withMessage("Color is required"),
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

      const { productId, quantity, size, color } = req.body

      // Validate product
      const product = await Product.findById(productId)
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Product not found" })
      }

      // Check if size exists and has stock
      const sizeInfo = product.sizes.find((s) => s.size === size)
      if (!sizeInfo) {
        return res.status(400).json({ message: "Size not available" })
      }

      // Check if color exists
      const colorExists = product.colors.some((c) => c.name === color)
      if (!colorExists) {
        return res.status(400).json({ message: "Color not available" })
      }

      // Get or create cart
      let cart = await Cart.findOne({ user: req.user.id })
      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] })
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId && item.size === size && item.color === color,
      )

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity

        // Check stock availability
        if (newQuantity > sizeInfo.stock) {
          return res.status(400).json({
            message: `Only ${sizeInfo.stock} items available in stock`,
          })
        }

        cart.items[existingItemIndex].quantity = newQuantity
      } else {
        // Check stock availability
        if (quantity > sizeInfo.stock) {
          return res.status(400).json({
            message: `Only ${sizeInfo.stock} items available in stock`,
          })
        }

        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          size,
          color,
          price: product.price,
        })
      }

      await cart.save()

      // Populate cart for response
      await cart.populate({
        path: "items.product",
        select: "name price images brand category",
      })

      res.json({
        success: true,
        message: "Item added to cart",
        data: cart,
      })
    } catch (error) {
      console.error("Add to cart error:", error)
      res.status(500).json({ message: "Server error adding to cart" })
    }
  },
)

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
router.put(
  "/items/:itemId",
  protect,
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { quantity } = req.body
      const cart = await Cart.findOne({ user: req.user.id })

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" })
      }

      const item = cart.items.id(req.params.itemId)
      if (!item) {
        return res.status(404).json({ message: "Item not found in cart" })
      }

      // Check stock availability
      const product = await Product.findById(item.product)
      const sizeInfo = product.sizes.find((s) => s.size === item.size)

      if (quantity > sizeInfo.stock) {
        return res.status(400).json({
          message: `Only ${sizeInfo.stock} items available in stock`,
        })
      }

      item.quantity = quantity
      await cart.save()

      // Populate cart for response
      await cart.populate({
        path: "items.product",
        select: "name price images brand category",
      })

      res.json({
        success: true,
        message: "Cart updated",
        data: cart,
      })
    } catch (error) {
      console.error("Update cart error:", error)
      res.status(500).json({ message: "Server error updating cart" })
    }
  },
)

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
router.delete("/items/:itemId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const item = cart.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    cart.items.pull(req.params.itemId)
    await cart.save()

    // Populate cart for response
    await cart.populate({
      path: "items.product",
      select: "name price images brand category",
    })

    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({ message: "Server error removing from cart" })
  }
})

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = []
    await cart.save()

    res.json({
      success: true,
      message: "Cart cleared",
      data: cart,
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({ message: "Server error clearing cart" })
  }
})

module.exports = router
