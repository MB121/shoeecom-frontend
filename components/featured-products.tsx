"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/types/product";

// Mock featured products data
const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Air Max Pro",
    brand: "Nike",
    price: 129.99,
    originalPrice: 159.99,
    images: ["/nike-air-max-sneakers-white-and-blue.png"],
    category: "sports",
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["White/Blue", "Black/Red", "Gray/Orange"],
    rating: 4.5,
    reviews: 128,
    inStock: true,
    description:
      "Premium athletic sneakers with advanced cushioning technology.",
    variants: [
      { id: "1-1", size: "9", color: "White/Blue", stock: 5 },
      { id: "1-2", size: "10", color: "White/Blue", stock: 3 },
    ],
  },
  {
    id: "2",
    name: "Classic Leather Boot",
    brand: "Timberland",
    price: 189.99,
    images: ["/brown-leather-boots-classic-style.png"],
    category: "boots",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Brown", "Black", "Tan"],
    rating: 4.8,
    reviews: 89,
    inStock: true,
    description: "Durable leather boots perfect for any weather condition.",
    variants: [
      { id: "2-1", size: "9", color: "Brown", stock: 8 },
      { id: "2-2", size: "10", color: "Brown", stock: 4 },
    ],
  },
  {
    id: "3",
    name: "Running Elite",
    brand: "Adidas",
    price: 149.99,
    images: ["/adidas-running-shoes-black-and-white.png"],
    category: "sports",
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["Black/White", "Blue/Silver", "Red/Black"],
    rating: 4.6,
    reviews: 203,
    inStock: true,
    description: "High-performance running shoes with responsive cushioning.",
    variants: [
      { id: "3-1", size: "9", color: "Black/White", stock: 12 },
      { id: "3-2", size: "10", color: "Black/White", stock: 7 },
    ],
  },
  {
    id: "4",
    name: "Casual Canvas",
    brand: "Converse",
    price: 79.99,
    images: ["/converse-canvas-sneakers-classic-style.png"],
    category: "casual",
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
    colors: ["White", "Black", "Red", "Navy"],
    rating: 4.3,
    reviews: 156,
    inStock: true,
    description: "Timeless canvas sneakers for everyday comfort and style.",
    variants: [
      { id: "4-1", size: "9", color: "White", stock: 15 },
      { id: "4-2", size: "10", color: "White", stock: 10 },
    ],
  },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();

  useEffect(() => {
    // Simulate API call
    setProducts(featuredProducts);
  }, []);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.variants[0];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: defaultVariant.size,
      color: defaultVariant.color,
      quantity: 1,
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of premium shoes that combine
            style, comfort, and quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      Sale
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleWishlistToggle(product)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {product.brand}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/products/${product.id}`}>{product.name}</Link>
                  </h3>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="font-bold text-lg">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {product.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{
                            backgroundColor: color
                              .toLowerCase()
                              .includes("white")
                              ? "#fff"
                              : color.toLowerCase().includes("black")
                              ? "#000"
                              : color.toLowerCase().includes("blue")
                              ? "#3b82f6"
                              : color.toLowerCase().includes("red")
                              ? "#ef4444"
                              : "#6b7280",
                          }}
                        />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{product.colors.length - 3}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
