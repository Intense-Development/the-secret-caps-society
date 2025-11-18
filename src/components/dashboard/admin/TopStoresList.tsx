"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export type TopStore = {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  growth: number;
};

interface TopStoresListProps {
  stores: TopStore[];
}

/**
 * Top Stores List Component
 * Displays top performing stores by revenue
 */
export function TopStoresList({ stores }: TopStoresListProps) {
  const t = useTranslations("admin.dashboard");

  if (stores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("topStores")}</CardTitle>
          <CardDescription>Top performing stores</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No stores data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("topStores")}</CardTitle>
        <CardDescription>Top performing stores</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>{t("revenue")}</TableHead>
              <TableHead>{t("orders")}</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>
                  {Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(store.revenue)}
                </TableCell>
                <TableCell>{store.orders}</TableCell>
                <TableCell>
                  <Badge variant="success" className="gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {store.growth.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/stores/${store.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {t("viewStore")}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

