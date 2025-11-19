"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Mock Data ---
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
];

const topProducts = [
  { id: 1, name: "Nike Air Max 90", sales: 150 },
  { id: 2, name: "Adidas Ultraboost", sales: 120 },
  { id: 3, name: "Puma Suede Classic", sales: 95 },
  { id: 4, name: "New Balance 574", sales: 80 },
  { id: 5, name: "Converse Chuck Taylor", sales: 75 },
];

const recentOrders = [
  { id: "ORD-123", customer: "John Doe", total: 125.0, status: "Shipped" },
  { id: "ORD-124", customer: "Jane Smith", total: 250.5, status: "Processing" },
  {
    id: "ORD-125",
    customer: "Mike Johnson",
    total: 89.99,
    status: "Delivered",
  },
];

const kpiData = {
  totalRevenue: "₹54,530",
  totalOrders: 487,
  newCustomers: 52,
  avgOrderValue: "₹112.00",
};

export function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.newCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgOrderValue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products & Recent Orders */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
                  >
                    <span className="text-sm">{product.name}</span>
                    <span className="font-semibold text-sm">
                      {product.sales} sold
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
                  >
                    <div>
                      <div className="font-semibold text-sm">{order.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer}
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      ${order.total.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
