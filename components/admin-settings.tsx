"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GeneralSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>General Store Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name</Label>
        <Input id="storeName" type="text" defaultValue="ShoeEcommerce" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          defaultValue="contact@shoeecommerce.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Default Currency</Label>
        <Input id="currency" type="text" defaultValue="USD" />
      </div>
      <Button>Save Changes</Button>
    </CardContent>
  </Card>
);

const PaymentSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Payment Gateway Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stripeKey">Stripe Public Key</Label>
        <Input id="stripeKey" type="text" placeholder="pk_live_..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stripeSecret">Stripe Secret Key</Label>
        <Input id="stripeSecret" type="password" placeholder="sk_live_..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="paypalId">PayPal Client ID</Label>
        <Input id="paypalId" type="text" placeholder="PayPal Client ID" />
      </div>
      <Button>Save Changes</Button>
    </CardContent>
  </Card>
);

const ShippingSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Shipping Configuration</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="domesticRate">Domestic Shipping Rate (₹)</Label>
        <Input id="domesticRate" type="number" defaultValue="5.00" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="intlRate">International Shipping Rate (₹)</Label>
        <Input id="intlRate" type="number" defaultValue="25.00" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="freeThreshold">Free Shipping Threshold (₹)</Label>
        <Input id="freeThreshold" type="number" placeholder="e.g., 100" />
      </div>
      <Button>Save Changes</Button>
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Security & Password</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPass">Current Password</Label>
        <Input id="currentPass" type="password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPass">New Password</Label>
        <Input id="newPass" type="password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPass">Confirm New Password</Label>
        <Input id="confirmPass" type="password" />
      </div>
      <Button>Update Password</Button>
    </CardContent>
  </Card>
);

export function AdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="payment">
          <PaymentSettings />
        </TabsContent>
        <TabsContent value="shipping">
          <ShippingSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
