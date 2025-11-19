"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Address
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Payment
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Options
    shippingMethod: "standard",
    paymentMethod: "card",
    saveAddress: false,
    sameAsBilling: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      price: 0,
      time: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      price: 15,
      time: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      price: 25,
      time: "1 business day",
    },
  ];
  const total = getTotal();
  const selectedShipping = shippingOptions.find(
    (option) => option.id === formData.shippingMethod
  );
  const subtotal = total;
  const shippingCost = selectedShipping?.price || 0;
  const tax = subtotal * 0.08; // 8% tax
  const finalTotal = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    }

    if (stepNumber === 3) {
      if (formData.paymentMethod === "card") {
        if (!formData.cardNumber.trim())
          newErrors.cardNumber = "Card number is required";
        if (!formData.expiryDate.trim())
          newErrors.expiryDate = "Expiry date is required";
        if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
        if (!formData.cardName.trim())
          newErrors.cardName = "Cardholder name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect to success page
      clearCart();
      router.push("/order-confirmation");
    } catch (error) {
      setErrors({ submit: "Failed to place order. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart before checking out.
            </p>
            <Button onClick={() => router.push("/products")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step > stepNumber ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-8 text-sm">
              <span
                className={
                  step >= 1
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                Shipping
              </span>
              <span
                className={
                  step >= 2
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                Delivery
              </span>
              <span
                className={
                  step >= 3
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                Payment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`pl-10 ${
                              errors.firstName ? "border-destructive" : ""
                            }`}
                            placeholder="John"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-destructive">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`pl-10 ${
                              errors.lastName ? "border-destructive" : ""
                            }`}
                            placeholder="Doe"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-sm text-destructive">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`pl-10 ${
                              errors.email ? "border-destructive" : ""
                            }`}
                            placeholder="john@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-destructive">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`pl-10 ${
                              errors.phone ? "border-destructive" : ""
                            }`}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-destructive">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? "border-destructive" : ""}
                        placeholder="123 Main Street"
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={errors.city ? "border-destructive" : ""}
                          placeholder="New York"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={errors.state ? "border-destructive" : ""}
                          placeholder="NY"
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive">
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={errors.zipCode ? "border-destructive" : ""}
                          placeholder="10001"
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive">
                            {errors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        checked={formData.saveAddress}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            saveAddress: checked as boolean,
                          }))
                        }
                      />
                      <Label htmlFor="saveAddress">
                        Save this address for future orders
                      </Label>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleNextStep}>
                        Continue to Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Delivery Options */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Delivery Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={formData.shippingMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          shippingMethod: value,
                        }))
                      }
                    >
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 p-4 border rounded-lg"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex-1">
                            <Label
                              htmlFor={option.id}
                              className="font-medium cursor-pointer"
                            >
                              {option.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {option.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {option.price === 0 ? "Free" : `$${option.price}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back to Shipping
                      </Button>
                      <Button onClick={handleNextStep}>
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                    </RadioGroup>

                    {formData.paymentMethod === "card" && (
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className={`pl-10 ${
                                errors.cardNumber ? "border-destructive" : ""
                              }`}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          {errors.cardNumber && (
                            <p className="text-sm text-destructive">
                              {errors.cardNumber}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              className={
                                errors.expiryDate ? "border-destructive" : ""
                              }
                              placeholder="MM/YY"
                            />
                            {errors.expiryDate && (
                              <p className="text-sm text-destructive">
                                {errors.expiryDate}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className={`pl-10 ${
                                  errors.cvv ? "border-destructive" : ""
                                }`}
                                placeholder="123"
                              />
                            </div>
                            {errors.cvv && (
                              <p className="text-sm text-destructive">
                                {errors.cvv}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className={
                              errors.cardName ? "border-destructive" : ""
                            }
                            placeholder="John Doe"
                          />
                          {errors.cardName && (
                            <p className="text-sm text-destructive">
                              {errors.cardName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {errors.submit && (
                      <p className="text-sm text-destructive">
                        {errors.submit}
                      </p>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        Back to Delivery
                      </Button>
                      <Button onClick={handlePlaceOrder} disabled={isLoading}>
                        {isLoading
                          ? "Processing..."
                          : `Place Order - $${finalTotal.toFixed(2)}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              Size: {item.size}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Color: {item.color}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0
                          ? "Free"
                          : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
