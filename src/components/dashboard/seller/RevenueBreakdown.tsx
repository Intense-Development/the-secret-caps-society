"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryDistributionChart } from "@/components/dashboard/admin/CategoryDistributionChart";
import type { RevenueByCategory, TopProduct } from "@/application/revenue/seller/getSellerRevenue";

interface RevenueBreakdownProps {
  byCategory: RevenueByCategory[];
  topProducts: TopProduct[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function RevenueBreakdown({
  byCategory,
  topProducts,
}: RevenueBreakdownProps) {
  // Convert to chart format
  const categoryChartData = byCategory.map((item) => ({
    name: item.category,
    value: item.revenue,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>
            Revenue distribution across product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryChartData.length > 0 ? (
            <>
              <CategoryDistributionChart data={categoryChartData} />
              <div className="mt-4 space-y-2">
                {byCategory.slice(0, 5).map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {item.orderCount} orders
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Best performing products by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantitySold} sold • {product.orderCount} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground">
              No product data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

