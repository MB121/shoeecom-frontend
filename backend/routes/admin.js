const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const Product = require("../models/Product")
const Order = require("../models/Order")
const { protect, admin } = require("../middleware/auth")
const router = express.Router()

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get("/dashboard", protect, admin, async (req, res) => {
  try {
    const { period = "30" } = req.query
    const days = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get basic counts
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ])

    // Revenue calculation
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
        },
      },
    ])

    const currentRevenue = revenueData[0]?.totalRevenue || 0
    const currentOrderCount = revenueData[0]?.totalOrders || 0

    // Previous period for comparison
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const previousRevenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
          totalOrders: { $sum: 1 },
        },
      },
    ])

    const previousRevenue = previousRevenueData[0]?.totalRevenue || 0
    const previousOrderCount = previousRevenueData[0]?.totalOrders || 0

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenue > 0 ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 0

    const orderGrowth =
      previousOrderCount > 0 ? (((currentOrderCount - previousOrderCount) / previousOrderCount) * 100).toFixed(1) : 0

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(10)

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ])

    // Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      totalStock: { $lt: 10 },
    })
      .select("name totalStock category")
      .limit(10)

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: currentRevenue,
          revenueGrowth: Number.parseFloat(revenueGrowth),
          orderGrowth: Number.parseFloat(orderGrowth),
        },
        recentOrders,
        orderStatus: orderStatusData,
        topProducts,
        lowStockProducts,
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ message: "Server error fetching dashboard data" })
  }
})

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter = {}
    if (req.query.role) {
      filter.role = req.query.role
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true"
    }
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search, "i") },
        { lastName: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ]
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error fetching users" })
  }
})

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put(
  "/users/:id/status",
  protect,
  admin,
  [body("isActive").isBoolean().withMessage("isActive must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { isActive } = req.body
      const user = await User.findById(req.params.id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Prevent admin from deactivating themselves
      if (user._id.toString() === req.user.id && !isActive) {
        return res.status(400).json({ message: "Cannot deactivate your own account" })
      }

      user.isActive = isActive
      await user.save()

      res.json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        data: user,
      })
    } catch (error) {
      console.error("Update user status error:", error)
      res.status(500).json({ message: "Server error updating user status" })
    }
  },
)

// @desc    Get user details with order history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("wishlist", "name price images")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's order history
    const orders = await Order.find({ user: req.params.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .limit(10)

    // Get user statistics
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$pricing.total" },
          avgOrderValue: { $avg: "$pricing.total" },
        },
      },
    ])

    res.json({
      success: true,
      data: {
        user,
        orders,
        stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 },
      },
    })
  } catch (error) {
    console.error("Get user details error:", error)
    res.status(500).json({ message: "Server error fetching user details" })
  }
})

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
router.get("/analytics/sales", protect, admin, async (req, res) => {
  try {
    const { period = "30", groupBy = "day" } = req.query
    const days = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let groupFormat
    switch (groupBy) {
      case "hour":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        }
        break
      case "day":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
        break
      case "month":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
        break
      default:
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$pricing.total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ])

    // Category performance
    const categoryData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ])

    res.json({
      success: true,
      data: {
        sales: salesData,
        categories: categoryData,
      },
    })
  } catch (error) {
    console.error("Sales analytics error:", error)
    res.status(500).json({ message: "Server error fetching sales analytics" })
  }
})

// @desc    Get inventory report
// @route   GET /api/admin/inventory/report
// @access  Private/Admin
router.get("/inventory/report", protect, admin, async (req, res) => {
  try {
    // Low stock products (less than 10 items)
    const lowStock = await Product.find({
      isActive: true,
      totalStock: { $lt: 10 },
    })
      .select("name brand category totalStock")
      .sort({ totalStock: 1 })

    // Out of stock products
    const outOfStock = await Product.find({
      isActive: true,
      totalStock: 0,
    })
      .select("name brand category")
      .sort({ name: 1 })

    // Top selling products (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topSelling = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 },
    ])

    // Category stock summary
    const categoryStock = await Product.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$totalStock" },
          avgStock: { $avg: "$totalStock" },
        },
      },
      { $sort: { totalStock: -1 } },
    ])

    res.json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        topSelling,
        categoryStock,
      },
    })
  } catch (error) {
    console.error("Inventory report error:", error)
    res.status(500).json({ message: "Server error generating inventory report" })
  }
})

// @desc    Bulk update product status
// @route   PUT /api/admin/products/bulk-status
// @access  Private/Admin
router.put(
  "/products/bulk-status",
  protect,
  admin,
  [
    body("productIds").isArray({ min: 1 }).withMessage("Product IDs array is required"),
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
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

      const { productIds, isActive } = req.body

      const result = await Product.updateMany({ _id: { $in: productIds } }, { isActive })

      res.json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
        data: { modifiedCount: result.modifiedCount },
      })
    } catch (error) {
      console.error("Bulk update products error:", error)
      res.status(500).json({ message: "Server error updating products" })
    }
  },
)

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private/Admin
router.get("/export/:type", protect, admin, async (req, res) => {
  try {
    const { type } = req.params
    const { startDate, endDate } = req.query

    let data
    let filename

    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    switch (type) {
      case "orders":
        data = await Order.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate("user", "firstName lastName email")
          .populate("items.product", "name brand")
          .sort({ createdAt: -1 })
        filename = `orders-export-${Date.now()}.json`
        break

      case "products":
        data = await Product.find({ isActive: true }).select("-reviews").sort({ name: 1 })
        filename = `products-export-${Date.now()}.json`
        break

      case "users":
        data = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 })
        filename = `users-export-${Date.now()}.json`
        break

      default:
        return res.status(400).json({ message: "Invalid export type" })
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      type,
      count: data.length,
      data,
    })
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({ message: "Server error exporting data" })
  }
})

module.exports = router
