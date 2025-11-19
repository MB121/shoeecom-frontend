const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
require("dotenv").config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shoe-ecommerce")
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@shoestore.com" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      process.exit(0)
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@shoestore.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
    })

    await admin.save()
    console.log("Admin user created successfully")
    console.log("Email: admin@shoestore.com")
    console.log("Password: admin123")
    console.log("Please change the password after first login!")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error)
    process.exit(1)
  }
}

createAdmin()
