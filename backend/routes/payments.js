const express = require("express")
const { body, validationResult } = require("express-validator")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Order = require("../models/Order")
const Product = require("../models/Product")
const { protect } = require("../middleware/auth")
const router = express.Router()

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
router.post(
  "/create-intent",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("Items array is required"),
    body("currency").optional().isIn(["usd", "eur", "gbp"]).withMessage("Invalid currency"),
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

      const { items, currency = "usd", shippingCost = 0, taxAmount = 0, discountAmount = 0 } = req.body

      // Validate items and calculate total
      let subtotal = 0
      const validatedItems = []

      for (const item of items) {
        const product = await Product.findById(item.productId)
        if (!product || !product.isActive) {
          return res.status(400).json({
            message: `Product ${item.name || "unknown"} is not available`,
          })
        }

        // Check stock
        const sizeInfo = product.sizes.find((s) => s.size === item.size)
        if (!sizeInfo || sizeInfo.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name} in size ${item.size}`,
          })
        }

        const itemTotal = product.price * item.quantity
        subtotal += itemTotal

        validatedItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })
      }

      // Calculate final amount
      const total = subtotal + shippingCost + taxAmount - discountAmount
      const amountInCents = Math.round(total * 100) // Convert to cents

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          userId: req.user.id,
          itemCount: items.length.toString(),
          subtotal: subtotal.toString(),
          shipping: shippingCost.toString(),
          tax: taxAmount.toString(),
          discount: discountAmount.toString(),
        },
      })

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: total,
          currency,
          items: validatedItems,
        },
      })
    } catch (error) {
      console.error("Create payment intent error:", error)
      res.status(500).json({ message: "Server error creating payment intent" })
    }
  },
)

// @desc    Confirm payment and create order
// @route   POST /api/payments/confirm
// @access  Private
router.post(
  "/confirm",
  protect,
  [
    body("paymentIntentId").notEmpty().withMessage("Payment intent ID is required"),
    body("items").isArray({ min: 1 }).withMessage("Items array is required"),
    body("shippingAddress.firstName").trim().notEmpty().withMessage("First name is required"),
    body("shippingAddress.lastName").trim().notEmpty().withMessage("Last name is required"),
    body("shippingAddress.email").isEmail().withMessage("Valid email is required"),
    body("shippingAddress.street").trim().notEmpty().withMessage("Street address is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode").trim().notEmpty().withMessage("Zip code is required"),
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

      const { paymentIntentId, items, shippingAddress, billingAddress, pricing } = req.body

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: "Payment has not been completed successfully",
        })
      }

      // Validate items and update stock
      const validatedItems = []
      let calculatedSubtotal = 0

      for (const item of items) {
        const product = await Product.findById(item.productId)
        if (!product || !product.isActive) {
          return res.status(400).json({
            message: `Product ${item.name || "unknown"} is not available`,
          })
        }

        // Check and update stock
        const sizeInfo = product.sizes.find((s) => s.size === item.size)
        if (!sizeInfo || sizeInfo.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name} in size ${item.size}`,
          })
        }

        // Update stock
        sizeInfo.stock -= item.quantity
        await product.save()

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
      }

      // Create order
      const order = await Order.create({
        user: req.user.id,
        items: validatedItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentInfo: {
          method: "stripe",
          transactionId: paymentIntent.id,
          status: "completed",
        },
        pricing: {
          subtotal: calculatedSubtotal,
          tax: pricing.tax || 0,
          shipping: pricing.shipping || 0,
          discount: pricing.discount || 0,
          total: calculatedSubtotal + (pricing.tax || 0) + (pricing.shipping || 0) - (pricing.discount || 0),
        },
        status: "confirmed",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(),
          },
          {
            status: "confirmed",
            timestamp: new Date(),
            note: "Payment confirmed via Stripe",
          },
        ],
      })

      res.json({
        success: true,
        message: "Payment confirmed and order created successfully",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          total: order.pricing.total,
          status: order.status,
        },
      })
    } catch (error) {
      console.error("Confirm payment error:", error)
      res.status(500).json({ message: "Server error confirming payment" })
    }
  },
)

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"]
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        console.log("Payment succeeded:", paymentIntent.id)

        // Update order payment status if exists
        const order = await Order.findOne({
          "paymentInfo.transactionId": paymentIntent.id,
        })

        if (order) {
          order.paymentInfo.status = "completed"
          await order.save()
        }
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log("Payment failed:", failedPayment.id)

        // Update order payment status
        const failedOrder = await Order.findOne({
          "paymentInfo.transactionId": failedPayment.id,
        })

        if (failedOrder) {
          failedOrder.paymentInfo.status = "failed"
          failedOrder.status = "cancelled"
          await failedOrder.save()
        }
        break

      case "charge.dispute.created":
        const dispute = event.data.object
        console.log("Dispute created:", dispute.id)
        // Handle dispute logic here
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    res.status(500).json({ message: "Webhook handler error" })
  }
})

// @desc    Create refund
// @route   POST /api/payments/refund
// @access  Private/Admin
router.post(
  "/refund",
  protect,
  [
    body("orderId").isMongoId().withMessage("Valid order ID is required"),
    body("amount").optional().isFloat({ min: 0 }).withMessage("Amount must be positive"),
    body("reason").optional().trim(),
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

      const { orderId, amount, reason } = req.body

      // Get order
      const order = await Order.findById(orderId)
      if (!order) {
        return res.status(404).json({ message: "Order not found" })
      }

      // Check if user owns order or is admin
      if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to refund this order" })
      }

      // Check if order was paid via Stripe
      if (order.paymentInfo.method !== "stripe" || !order.paymentInfo.transactionId) {
        return res.status(400).json({ message: "Order cannot be refunded via Stripe" })
      }

      // Create refund
      const refundAmount = amount ? Math.round(amount * 100) : undefined // Convert to cents

      const refund = await stripe.refunds.create({
        payment_intent: order.paymentInfo.transactionId,
        amount: refundAmount,
        reason: reason || "requested_by_customer",
        metadata: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
        },
      })

      // Update order status
      order.paymentInfo.status = "refunded"
      order.status = "returned"
      order.statusHistory.push({
        status: "returned",
        timestamp: new Date(),
        note: `Refund processed: ${refund.id}`,
      })

      await order.save()

      res.json({
        success: true,
        message: "Refund processed successfully",
        data: {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      })
    } catch (error) {
      console.error("Refund error:", error)
      res.status(500).json({ message: "Server error processing refund" })
    }
  },
)

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
router.get("/methods", protect, async (req, res) => {
  try {
    // In a real app, you might store customer payment methods
    // For now, return available payment options
    const paymentMethods = [
      {
        id: "stripe",
        name: "Credit/Debit Card",
        description: "Pay securely with your credit or debit card",
        enabled: true,
        fees: "No additional fees",
      },
      {
        id: "paypal",
        name: "PayPal",
        description: "Pay with your PayPal account",
        enabled: false, // Not implemented yet
        fees: "No additional fees",
      },
      {
        id: "cash_on_delivery",
        name: "Cash on Delivery",
        description: "Pay when your order is delivered",
        enabled: true,
        fees: "Additional $5 handling fee",
      },
    ]

    res.json({
      success: true,
      data: paymentMethods,
    })
  } catch (error) {
    console.error("Get payment methods error:", error)
    res.status(500).json({ message: "Server error fetching payment methods" })
  }
})

module.exports = router
