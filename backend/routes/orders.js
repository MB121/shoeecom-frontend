const express = require("express")
const { body, validationResult } = require("express-validator")
const Order = require("../models/Order")
const Product = require("../models/Product")
const Cart = require("../models/Cart")
const { protect, admin } = require("../middleware/auth")
const router = express.Router()

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post(
  "/",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
    body("shippingAddress.firstName").trim().notEmpty().withMessage("First name is required"),
    body("shippingAddress.lastName").trim().notEmpty().withMessage("Last name is required"),
    body("shippingAddress.email").isEmail().withMessage("Valid email is required"),
    body("shippingAddress.phone").trim().notEmpty().withMessage("Phone number is required"),
    body("shippingAddress.street").trim().notEmpty().withMessage("Street address is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode").trim().notEmpty().withMessage("Zip code is required"),
    body("paymentInfo.method").isIn(["stripe", "paypal", "cash_on_delivery"]).withMessage("Invalid payment method"),
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

      const { items, shippingAddress, billingAddress, paymentInfo, pricing } = req.body

      // Validate items and check stock
      const validatedItems = []
      let calculatedSubtotal = 0

      for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product || !product.isActive) {
          return res.status(400).json({
            message: `Product ${item.name || "unknown"} is not available`,
          })
        }

        // Check if size exists and has stock
        const sizeInfo = product.sizes.find((s) => s.size === item.size)
        if (!sizeInfo || sizeInfo.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name} in size ${item.size}`,
          })
        }

        // Check if color exists
        const colorExists = product.colors.some((c) => c.name === item.color)
        if (!colorExists) {
          return res.status(400).json({
            message: `Color ${item.color} not available for ${product.name}`,
          })
        }

        validatedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url,
        })

        calculatedSubtotal += product.price * item.quantity

        // Update product stock
        sizeInfo.stock -= item.quantity
        await product.save()
      }

      // Create order
      const order = await Order.create({
        user: req.user.id,
        items: validatedItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentInfo,
        pricing: {
          subtotal: calculatedSubtotal,
          tax: pricing.tax || 0,
          shipping: pricing.shipping || 0,
          discount: pricing.discount || 0,
          total: calculatedSubtotal + (pricing.tax || 0) + (pricing.shipping || 0) - (pricing.discount || 0),
        },
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(),
          },
        ],
      })

      // Clear user's cart after successful order
      await Cart.findOneAndDelete({ user: req.user.id })

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      })
    } catch (error) {
      console.error("Create order error:", error)
      res.status(500).json({ message: "Server error creating order" })
    }
  },
)

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments({ user: req.user.id })

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get user orders error:", error)
    res.status(500).json({ message: "Server error fetching orders" })
  }
})

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images brand")
      .populate("user", "firstName lastName email")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" })
    }

    res.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Get order error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Order not found" })
    }
    res.status(500).json({ message: "Server error fetching order" })
  }
})

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" })
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      })
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (product) {
        const sizeInfo = product.sizes.find((s) => s.size === item.size)
        if (sizeInfo) {
          sizeInfo.stock += item.quantity
          await product.save()
        }
      }
    }

    order.status = "cancelled"
    order.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Cancelled by customer",
    })

    await order.save()

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    })
  } catch (error) {
    console.error("Cancel order error:", error)
    res.status(500).json({ message: "Server error cancelling order" })
  }
})

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // Build filter
    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.paymentStatus) {
      filter["paymentInfo.status"] = req.query.paymentStatus
    }

    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$pricing.total" },
        },
      },
    ])

    res.json({
      success: true,
      data: orders,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get all orders error:", error)
    res.status(500).json({ message: "Server error fetching orders" })
  }
})

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put(
  "/:id/status",
  protect,
  admin,
  [
    body("status")
      .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"])
      .withMessage("Invalid status"),
    body("note").optional().trim(),
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

      const { status, note, tracking } = req.body
      const order = await Order.findById(req.params.id)

      if (!order) {
        return res.status(404).json({ message: "Order not found" })
      }

      order.status = status
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
      })

      // Update tracking info if provided
      if (tracking) {
        order.tracking = {
          carrier: tracking.carrier,
          trackingNumber: tracking.trackingNumber,
          trackingUrl: tracking.trackingUrl,
        }
      }

      // Set delivery dates
      if (status === "shipped" && tracking?.estimatedDelivery) {
        order.estimatedDelivery = new Date(tracking.estimatedDelivery)
      }
      if (status === "delivered") {
        order.actualDelivery = new Date()
      }

      await order.save()

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      })
    } catch (error) {
      console.error("Update order status error:", error)
      res.status(500).json({ message: "Server error updating order status" })
    }
  },
)

// @desc    Get order analytics (Admin only)
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
router.get("/admin/analytics", protect, admin, async (req, res) => {
  try {
    const { period = "30" } = req.query
    const days = Number.parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled", "returned"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Status distribution
    const statusData = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Top products
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
      { $limit: 10 },
    ])

    res.json({
      success: true,
      data: {
        revenue: revenueData,
        status: statusData,
        topProducts,
      },
    })
  } catch (error) {
    console.error("Get order analytics error:", error)
    res.status(500).json({ message: "Server error fetching analytics" })
  }
})

module.exports = router
