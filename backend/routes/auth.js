const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { generateToken, protect } = require("../middleware/auth")
const router = express.Router()

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
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

      const { firstName, lastName, email, password, phone } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" })
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
      })

      // Generate token
      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Register error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
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

      const { email, password } = req.body

      // Check if user exists and get password
      const user = await User.findOne({ email }).select("+password")
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" })
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is deactivated" })
      }

      // Check password
      const isMatch = await user.matchPassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist")

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error fetching profile" })
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  protect,
  [
    body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
    body("phone").optional().trim(),
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

      const { firstName, lastName, phone } = req.body

      const user = await User.findById(req.user.id)

      if (firstName) user.firstName = firstName
      if (lastName) user.lastName = lastName
      if (phone !== undefined) user.phone = phone

      await user.save()

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error updating profile" })
    }
  },
)

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user.id).select("+password")

      // Check current password
      const isMatch = await user.matchPassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({ message: "Server error changing password" })
    }
  },
)

// @desc    Add address
// @route   POST /api/auth/addresses
// @access  Private
router.post(
  "/addresses",
  protect,
  [
    body("type").isIn(["home", "work", "other"]).withMessage("Invalid address type"),
    body("street").trim().notEmpty().withMessage("Street is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("zipCode").trim().notEmpty().withMessage("Zip code is required"),
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

      const user = await User.findById(req.user.id)
      const { type, street, city, state, zipCode, country, isDefault } = req.body

      // If this is set as default, remove default from other addresses
      if (isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false))
      }

      user.addresses.push({
        type,
        street,
        city,
        state,
        zipCode,
        country: country || "USA",
        isDefault: isDefault || false,
      })

      await user.save()

      res.status(201).json({
        success: true,
        message: "Address added successfully",
        addresses: user.addresses,
      })
    } catch (error) {
      console.error("Add address error:", error)
      res.status(500).json({ message: "Server error adding address" })
    }
  },
)

// @desc    Update address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
router.put("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const address = user.addresses.id(req.params.addressId)

    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    const { type, street, city, state, zipCode, country, isDefault } = req.body

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false))
    }

    if (type) address.type = type
    if (street) address.street = street
    if (city) address.city = city
    if (state) address.state = state
    if (zipCode) address.zipCode = zipCode
    if (country) address.country = country
    if (isDefault !== undefined) address.isDefault = isDefault

    await user.save()

    res.json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ message: "Server error updating address" })
  }
})

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
router.delete("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const address = user.addresses.id(req.params.addressId)

    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    user.addresses.pull(req.params.addressId)
    await user.save()

    res.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({ message: "Server error deleting address" })
  }
})

module.exports = router
