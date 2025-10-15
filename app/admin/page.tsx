"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminProducts } from "@/components/admin-products";
import { AdminOrders } from "@/components/admin-orders";
import { AdminCustomers } from "@/components/admin-customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPage() {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "products":
        return <AdminProducts />;
      case "orders":
        return <AdminOrders />;
      case "customers":
        return <AdminCustomers />;
      default:
        return <AdminDashboard />;
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your account.
            </p>
            <Button onClick={() => (window.location.href = "/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
