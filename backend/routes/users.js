const express = require("express")
const User = require("../models/User")
const Product = require("../models/Product")
const { protect } = require("../middleware/auth")
const router = express.Router()

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
router.post("/wishlist/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const product = await Product.findById(req.params.productId)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: "Product already in wishlist" })
    }

    user.wishlist.push(req.params.productId)
    await user.save()

    res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    res.status(500).json({ message: "Server error adding to wishlist" })
  }
})

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
router.delete("/wishlist/:productId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    // Check if product is in wishlist
    if (!user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ message: "Product not in wishlist" })
    }

    user.wishlist.pull(req.params.productId)
    await user.save()

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({ message: "Server error removing from wishlist" })
  }
})

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
router.get("/wishlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      select: "name price images category brand rating",
    })

    res.json({
      success: true,
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({ message: "Server error fetching wishlist" })
  }
})

module.exports = router
