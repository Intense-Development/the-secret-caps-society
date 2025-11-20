"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { RevenueOverview } from "./RevenueOverview";
import { RevenueBreakdown } from "./RevenueBreakdown";
import { RevenueTrendChart } from "@/components/dashboard/admin/RevenueTrendChart";
import type {
  RevenueOverview as RevenueOverviewType,
  RevenuePeriod,
} from "@/application/revenue/seller/getSellerRevenue";
import type { RevenueTrendData } from "@/components/dashboard/admin/RevenueTrendChart";
import type { RevenueByCategory, TopProduct } from "@/application/revenue/seller/getSellerRevenue";
import { toast } from "sonner";

interface SellerRevenueClientProps {
  initialData: {
    overview: RevenueOverviewType;
    trend: RevenueTrendData[];
    byCategory: RevenueByCategory[];
    topProducts: TopProduct[];
  };
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerRevenueClient({
  initialData,
  storeId,
  stores,
}: SellerRevenueClientProps) {
  const t = useTranslations("seller.revenue");
  const [period, setPeriod] = useState<RevenuePeriod>("30d");
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(storeId);

  // Get selected store from localStorage
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch data when period or store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchRevenueData(selectedStoreId, period);
    }
  }, [selectedStoreId, period]);

  const fetchRevenueData = async (storeId: string, period: RevenuePeriod) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/seller/revenue?storeId=${storeId}&period=${period}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedStoreId) {
      toast.error("No store selected");
      return;
    }

    // Create CSV content
    const csvRows: string[] = [];

    // Overview
    csvRows.push("Revenue Overview");
    csvRows.push(`Period,${period}`);
    csvRows.push(`Total Revenue,$${data.overview.totalRevenue.toFixed(2)}`);
    csvRows.push(`Average Order Value,$${data.overview.averageOrderValue.toFixed(2)}`);
    csvRows.push(`Total Orders,${data.overview.totalOrders}`);
    csvRows.push(`Growth,${data.overview.growthPercentage.toFixed(2)}%`);
    csvRows.push("");

    // Revenue by Category
    csvRows.push("Revenue by Category");
    csvRows.push("Category,Revenue,Order Count");
    data.byCategory.forEach((item) => {
      csvRows.push(`${item.category},$${item.revenue.toFixed(2)},${item.orderCount}`);
    });
    csvRows.push("");

    // Top Products
    csvRows.push("Top Products");
    csvRows.push("Product Name,Revenue,Quantity Sold,Order Count");
    data.topProducts.forEach((product) => {
      csvRows.push(
        `${product.product_name},$${product.revenue.toFixed(2)},${product.quantitySold},${product.orderCount}`
      );
    });

    // Download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("selectedStoreId", newStoreId);
  };

  if (stores.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Revenue</h2>
          <p className="text-muted-foreground">
            Track your revenue and sales analytics
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can view revenue analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Revenue</h2>
          <p className="text-muted-foreground">
            Track your revenue and sales analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          {stores.length > 1 && (
            <Select
              value={selectedStoreId || ""}
              onValueChange={handleStoreChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={period} onValueChange={(value) => setPeriod(value as RevenuePeriod)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <RevenueOverview data={data.overview} />

          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Revenue over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.trend.length > 0 ? (
                <RevenueTrendChart data={data.trend} />
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                  No revenue data available for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Breakdown */}
          <RevenueBreakdown
            byCategory={data.byCategory}
            topProducts={data.topProducts}
          />
        </>
      )}
    </div>
  );
}

