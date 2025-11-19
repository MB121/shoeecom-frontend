const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["men", "women", "kids", "sports", "casual", "formal"],
    },
    subcategory: {
      type: String,
      required: [true, "Product subcategory is required"],
      enum: [
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
      ],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    sizes: [
      {
        size: {
          type: String,
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          min: [0, "Stock cannot be negative"],
        },
      },
    ],
    colors: [
      {
        name: {
          type: String,
          required: true,
        },
        hexCode: {
          type: String,
          required: true,
          match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color code"],
        },
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    features: [String],
    materials: [String],
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be less than 0"],
        max: [5, "Rating cannot be more than 5"],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, "Review comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    seoTitle: String,
    seoDescription: String,
    totalStock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate total stock before saving
productSchema.pre("save", function (next) {
  this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0)
  next()
})

// Index for search optimization
productSchema.index({ name: "text", description: "text", brand: "text" })
productSchema.index({ category: 1, subcategory: 1 })
productSchema.index({ price: 1 })
productSchema.index({ "rating.average": -1 })

module.exports = mongoose.model("Product", productSchema)
