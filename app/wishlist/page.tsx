"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: any) => {
    // Add first available variant to cart
    if (item.variants && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        size: firstVariant.size,
        color: firstVariant.color,
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My SoleStyle Wishlist",
          text: "Check out my favorite shoes on SoleStyle!",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Wishlist link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                My Wishlist
              </h1>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} saved for
                later
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={clearWishlist}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {items.length > 0 ? (
            <>
              {/* Wishlist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        <h3 className="font-medium text-sm leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {item.brand}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(item.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({item.reviews})
                          </span>
                        </div>

                        {/* Price */}
                        <p className="font-bold text-lg">${item.price}</p>

                        {/* Available Variants */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Available sizes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(item.variants.map((v) => v.size))]
                                .slice(0, 4)
                                .map((size) => (
                                  <Badge
                                    key={size}
                                    variant="outline"
                                    className="text-xs px-2 py-0"
                                  >
                                    {size}
                                  </Badge>
                                ))}
                              {[...new Set(item.variants.map((v) => v.size))]
                                .length > 4 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0"
                                >
                                  +
                                  {[
                                    ...new Set(
                                      item.variants.map((v) => v.size)
                                    ),
                                  ].length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/products/${item.id}`)
                            }
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">
                    Love everything in your wishlist?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add all items to your cart and checkout quickly.
                  </p>
                  <Button
                    onClick={() => {
                      items.forEach((item) => handleAddToCart(item));
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add All to Cart
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Save items you love to your wishlist and never lose track of
                  them.
                </p>
                <Button onClick={() => (window.location.href = "/products")}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
