const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;

const sampleProducts = [
  // Men's Sneakers
  {
    name: "Air Max Revolution",
    description:
      "Revolutionary comfort meets iconic style in these premium sneakers. Featuring advanced cushioning technology and breathable mesh upper for all-day comfort.",
    price: 129.99,
    originalPrice: 159.99,
    category: "men",
    subcategory: "sneakers",
    brand: "Nike",
    sizes: [
      { size: "8", stock: 15 },
      { size: "9", stock: 20 },
      { size: "10", stock: 18 },
      { size: "11", stock: 12 },
      { size: "12", stock: 8 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Navy", hexCode: "#1E3A8A" },
    ],
    images: [
      { url: "/black-nike-air-max-sneakers.jpg", alt: "Air Max Revolution Black", isPrimary: true },
      { url: "/white-nike-air-max-sneakers.jpg", alt: "Air Max Revolution White", isPrimary: false },
    ],
    features: ["Air cushioning", "Breathable mesh", "Rubber outsole", "Lightweight design"],
    materials: ["Synthetic leather", "Mesh", "Rubber"],
    weight: 0.8,
    isFeatured: true,
  },
  {
    name: "Classic Court Pro",
    description:
      "Timeless court-inspired design with modern comfort features. Perfect for casual wear and light athletic activities.",
    price: 89.99,
    category: "men",
    subcategory: "sneakers",
    brand: "Adidas",
    sizes: [
      { size: "8", stock: 10 },
      { size: "9", stock: 15 },
      { size: "10", stock: 12 },
      { size: "11", stock: 8 },
    ],
    colors: [
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Black", hexCode: "#000000" },
    ],
    images: [{ url: "/white-adidas-court-sneakers.jpg", alt: "Classic Court Pro White", isPrimary: true }],
    features: ["Classic design", "Comfortable fit", "Durable construction"],
    materials: ["Leather", "Rubber"],
  },

  // Men's Boots
  {
    name: "Rugged Trail Boot",
    description:
      "Built for adventure with waterproof construction and superior grip. Perfect for hiking and outdoor activities.",
    price: 179.99,
    category: "men",
    subcategory: "boots",
    brand: "Timberland",
    sizes: [
      { size: "8", stock: 8 },
      { size: "9", stock: 12 },
      { size: "10", stock: 10 },
      { size: "11", stock: 6 },
    ],
    colors: [
      { name: "Brown", hexCode: "#8B4513" },
      { name: "Black", hexCode: "#000000" },
    ],
    images: [{ url: "/brown-timberland-hiking-boots.jpg", alt: "Rugged Trail Boot Brown", isPrimary: true }],
    features: ["Waterproof", "Anti-fatigue technology", "Premium leather", "Slip-resistant"],
    materials: ["Full-grain leather", "Rubber", "Steel shank"],
  },

  // Women's Heels
  {
    name: "Elegant Evening Heel",
    description:
      "Sophisticated high heels perfect for special occasions. Features cushioned insole for comfort during extended wear.",
    price: 149.99,
    category: "women",
    subcategory: "heels",
    brand: "Jimmy Choo",
    sizes: [
      { size: "6", stock: 5 },
      { size: "7", stock: 8 },
      { size: "8", stock: 10 },
      { size: "9", stock: 6 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "Red", hexCode: "#DC2626" },
      { name: "Nude", hexCode: "#F3E8D0" },
    ],
    images: [{ url: "/black-elegant-high-heels.jpg", alt: "Elegant Evening Heel Black", isPrimary: true }],
    features: ["4-inch heel", "Cushioned insole", "Pointed toe", "Ankle strap"],
    materials: ["Patent leather", "Leather lining"],
  },
  {
    name: "Comfort Block Heel",
    description: "Stylish block heels that provide stability and comfort. Perfect for office wear or casual outings.",
    price: 99.99,
    category: "women",
    subcategory: "heels",
    brand: "Clarks",
    sizes: [
      { size: "6", stock: 12 },
      { size: "7", stock: 15 },
      { size: "8", stock: 18 },
      { size: "9", stock: 10 },
    ],
    colors: [
      { name: "Tan", hexCode: "#D2B48C" },
      { name: "Black", hexCode: "#000000" },
    ],
    images: [{ url: "/tan-block-heel-shoes.jpg", alt: "Comfort Block Heel Tan", isPrimary: true }],
    features: ["2.5-inch block heel", "Cushioned footbed", "Adjustable strap"],
    materials: ["Suede", "Leather"],
  },

  // Women's Flats
  {
    name: "Ballet Comfort Flat",
    description: "Classic ballet flats with modern comfort technology. Perfect for everyday wear with any outfit.",
    price: 69.99,
    category: "women",
    subcategory: "flats",
    brand: "Tory Burch",
    sizes: [
      { size: "6", stock: 20 },
      { size: "7", stock: 25 },
      { size: "8", stock: 22 },
      { size: "9", stock: 15 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "Nude", hexCode: "#F3E8D0" },
      { name: "Navy", hexCode: "#1E3A8A" },
    ],
    images: [{ url: "/black-ballet-flats.jpg", alt: "Ballet Comfort Flat Black", isPrimary: true }],
    features: ["Flexible sole", "Cushioned insole", "Slip-on design"],
    materials: ["Leather", "Rubber sole"],
    isFeatured: true,
  },

  // Kids' Sneakers
  {
    name: "Kids Fun Runner",
    description:
      "Colorful and comfortable sneakers designed for active kids. Features easy velcro closure and durable construction.",
    price: 49.99,
    category: "kids",
    subcategory: "sneakers",
    brand: "Nike",
    sizes: [
      { size: "1", stock: 15 },
      { size: "2", stock: 18 },
      { size: "3", stock: 20 },
      { size: "4", stock: 12 },
    ],
    colors: [
      { name: "Blue", hexCode: "#3B82F6" },
      { name: "Pink", hexCode: "#EC4899" },
      { name: "Green", hexCode: "#10B981" },
    ],
    images: [{ url: "/colorful-kids-sneakers.jpg", alt: "Kids Fun Runner", isPrimary: true }],
    features: ["Velcro closure", "Non-slip sole", "Breathable material"],
    materials: ["Synthetic", "Mesh", "Rubber"],
  },
  {
    name: "Little Explorer Boot",
    description: "Durable boots for little adventurers. Waterproof and comfortable for outdoor play.",
    price: 59.99,
    category: "kids",
    subcategory: "boots",
    brand: "Timberland",
    sizes: [
      { size: "1", stock: 8 },
      { size: "2", stock: 10 },
      { size: "3", stock: 12 },
      { size: "4", stock: 6 },
    ],
    colors: [
      { name: "Brown", hexCode: "#8B4513" },
      { name: "Pink", hexCode: "#EC4899" },
    ],
    images: [{ url: "/kids-brown-boots.jpg", alt: "Little Explorer Boot", isPrimary: true }],
    features: ["Waterproof", "Easy on/off", "Durable construction"],
    materials: ["Synthetic leather", "Rubber"],
  },

  // Sports - Running
  {
    name: "Marathon Pro Runner",
    description:
      "Professional-grade running shoes with advanced cushioning and energy return technology. Perfect for long-distance running.",
    price: 199.99,
    category: "sports",
    subcategory: "running",
    brand: "Adidas",
    sizes: [
      { size: "8", stock: 10 },
      { size: "9", stock: 15 },
      { size: "10", stock: 12 },
      { size: "11", stock: 8 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Orange", hexCode: "#F97316" },
    ],
    images: [{ url: "/professional-running-shoes.png", alt: "Marathon Pro Runner", isPrimary: true }],
    features: ["Energy return", "Lightweight", "Breathable upper", "Continental rubber outsole"],
    materials: ["Primeknit", "Boost foam", "Continental rubber"],
    isFeatured: true,
  },
  {
    name: "Speed Demon Track",
    description:
      "Lightweight track shoes designed for speed and performance. Features spike-ready sole for competitive running.",
    price: 159.99,
    category: "sports",
    subcategory: "running",
    brand: "Nike",
    sizes: [
      { size: "8", stock: 6 },
      { size: "9", stock: 8 },
      { size: "10", stock: 10 },
      { size: "11", stock: 5 },
    ],
    colors: [
      { name: "Red", hexCode: "#DC2626" },
      { name: "Blue", hexCode: "#3B82F6" },
    ],
    images: [{ url: "/red-track-running-spikes.jpg", alt: "Speed Demon Track", isPrimary: true }],
    features: ["Spike-ready", "Ultra-lightweight", "Responsive foam"],
    materials: ["Flyknit", "ZoomX foam", "Pebax plate"],
  },

  // Sports - Basketball
  {
    name: "Court Dominator High",
    description: "High-top basketball shoes with superior ankle support and court grip. Designed for serious players.",
    price: 179.99,
    category: "sports",
    subcategory: "basketball",
    brand: "Jordan",
    sizes: [
      { size: "9", stock: 12 },
      { size: "10", stock: 15 },
      { size: "11", stock: 10 },
      { size: "12", stock: 8 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "White", hexCode: "#FFFFFF" },
      { name: "Red", hexCode: "#DC2626" },
    ],
    images: [{ url: "/black-high-top-basketball-shoes.jpg", alt: "Court Dominator High", isPrimary: true }],
    features: ["High-top design", "Air cushioning", "Herringbone traction", "Ankle support"],
    materials: ["Leather", "Synthetic", "Air-Sole unit"],
  },

  // Formal - Dress Shoes
  {
    name: "Executive Oxford",
    description:
      "Classic oxford dress shoes crafted from premium leather. Perfect for business meetings and formal occasions.",
    price: 249.99,
    category: "formal",
    subcategory: "dress-shoes",
    brand: "Cole Haan",
    sizes: [
      { size: "8", stock: 8 },
      { size: "9", stock: 12 },
      { size: "10", stock: 10 },
      { size: "11", stock: 6 },
    ],
    colors: [
      { name: "Black", hexCode: "#000000" },
      { name: "Brown", hexCode: "#8B4513" },
    ],
    images: [{ url: "/black-oxford-dress-shoes.jpg", alt: "Executive Oxford Black", isPrimary: true }],
    features: ["Full-grain leather", "Goodyear welt construction", "Leather sole", "Classic lacing"],
    materials: ["Full-grain leather", "Leather sole", "Cotton laces"],
  },
  {
    name: "Gentleman's Loafer",
    description:
      "Sophisticated penny loafers with modern comfort features. Ideal for business casual and smart casual looks.",
    price: 189.99,
    category: "formal",
    subcategory: "loafers",
    brand: "Gucci",
    sizes: [
      { size: "8", stock: 5 },
      { size: "9", stock: 8 },
      { size: "10", stock: 6 },
      { size: "11", stock: 4 },
    ],
    colors: [
      { name: "Brown", hexCode: "#8B4513" },
      { name: "Black", hexCode: "#000000" },
    ],
    images: [{ url: "/brown-leather-loafers.jpg", alt: "Gentleman's Loafer Brown", isPrimary: true }],
    features: ["Slip-on design", "Penny strap detail", "Cushioned insole", "Flexible sole"],
    materials: ["Italian leather", "Leather lining", "Rubber sole"],
  },
]

const seedProducts = async () => {
  try {
    console.log("🟡 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🧹 Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Cleared existing products");

    console.log("🌱 Inserting new sample products...");
    await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${sampleProducts.length} products`);

    await mongoose.connection.close();
    console.log("🔒 Connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts()
