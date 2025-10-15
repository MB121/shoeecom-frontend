"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCart();

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={`${item.id}-${item.size}-${item.color}`}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Size: {item.size} | Color: {item.color}
                </p>
                <p className="font-bold text-lg">₹{item.price}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.size,
                      item.color,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.id,
                      item.size,
                      item.color,
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                  className="w-16 text-center"
                  min="1"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.size,
                      item.color,
                      item.quantity + 1
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id, item.size, item.color)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
