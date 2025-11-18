"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Check, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleApprove = async (storeId: string) => {
    setProcessingIds((prev) => new Set(prev).add(storeId));
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Store approved successfully");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to approve store");
      }
    } catch (error) {
      console.error("Error approving store:", error);
      toast.error("Failed to approve store");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  };

  const handleReject = async (storeId: string) => {
    setProcessingIds((prev) => new Set(prev).add(storeId));
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Rejected from dashboard" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Store rejected");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to reject store");
      }
    } catch (error) {
      console.error("Error rejecting store:", error);
      toast.error("Failed to reject store");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  };

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={processingIds.has(store.id)}
                        >
                          {processingIds.has(store.id) ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          {t("approve")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Store</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve "{store.name}"? This action will
                            verify the store and allow it to start selling on the platform.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleApprove(store.id)}>
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingIds.has(store.id)}
                        >
                          {processingIds.has(store.id) ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          {t("reject")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Store</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject "{store.name}"? This action cannot be
                            undone easily.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleReject(store.id)}>
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

