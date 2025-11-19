"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";

export function CartSummary() {
  const { items, getTotal } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = () => {
    // Mock coupon logic
    if (couponCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span>₹{subtotal?.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `${shipping.toFixed(2)}`}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponCode.toLowerCase() === "save10" && discount > 0 && (
            <p className="text-sm text-green-600">Coupon applied! 10% off</p>
          )}
        </div>

        <Link href="/checkout" className="w-full">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>

        <Link href="/products" className="block text-center">
          <Button variant="ghost" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
