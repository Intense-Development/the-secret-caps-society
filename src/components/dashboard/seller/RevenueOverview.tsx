"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package } from "lucide-react";
import type { RevenueOverview as RevenueOverviewType } from "@/application/revenue/seller/getSellerRevenue";

interface RevenueOverviewProps {
  data: RevenueOverviewType;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function RevenueOverview({ data }: RevenueOverviewProps) {
  const isPositiveGrowth = data.growthPercentage >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositiveGrowth ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span className={isPositiveGrowth ? "text-green-600" : "text-red-600"}>
              {isPositiveGrowth ? "+" : ""}
              {data.growthPercentage.toFixed(1)}%
            </span>
            <span className="ml-1">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.averageOrderValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per order average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Completed orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
          {isPositiveGrowth ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isPositiveGrowth ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositiveGrowth ? "+" : ""}
            {data.growthPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Revenue growth
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

