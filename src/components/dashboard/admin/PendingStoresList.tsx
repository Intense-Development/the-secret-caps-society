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
import { format } from "date-fns";
import { Check, X, ExternalLink } from "lucide-react";

export type PendingStore = {
  id: string;
  name: string;
  owner: string;
  submittedAt: Date;
  category: string;
};

interface PendingStoresListProps {
  stores: PendingStore[];
}

/**
 * Pending Stores List Component
 * Displays stores awaiting approval with action buttons
 */
export function PendingStoresList({ stores }: PendingStoresListProps) {
  const t = useTranslations("admin.dashboard");

  if (stores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("pendingStores")}</CardTitle>
          <CardDescription>Stores awaiting verification</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No pending stores at this time
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pendingStores")}</CardTitle>
        <CardDescription>Stores awaiting verification</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.owner}</TableCell>
                <TableCell>
                  <Badge variant="outline">{store.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(store.submittedAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/stores/${store.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    <Button variant="default" size="sm">
                      <Check className="h-4 w-4 mr-1" />
                      {t("approve")}
                    </Button>
                    <Button variant="destructive" size="sm">
                      <X className="h-4 w-4 mr-1" />
                      {t("reject")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

