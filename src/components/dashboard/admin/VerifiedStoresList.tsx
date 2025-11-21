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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Check, X, ExternalLink, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type VerifiedStore = {
  id: string;
  name: string;
  owner: string;
  verifiedAt: Date;
  productsCount?: number;
};

interface VerifiedStoresListProps {
  stores: VerifiedStore[];
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  loading?: boolean;
}

/**
 * Verified Stores List Component
 * Displays verified stores with action buttons (View, Revoke, Edit)
 * Supports pagination for browsing all verified stores
 */
export function VerifiedStoresList({
  stores,
  totalCount,
  page = 1,
  onPageChange,
  itemsPerPage = 15,
  loading = false,
}: VerifiedStoresListProps) {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleRevoke = async (storeId: string) => {
    setProcessingIds((prev) => new Set(prev).add(storeId));
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/revoke`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t("revokeSuccess") || "Store verification revoked successfully");
        router.refresh();
      } else {
        toast.error(data.error || t("revokeError") || "Failed to revoke verification");
      }
    } catch (error) {
      console.error("Error revoking verification:", error);
      toast.error(t("revokeError") || "Failed to revoke verification");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(storeId);
        return next;
      });
    }
  };

  const totalPages = totalCount && itemsPerPage ? Math.ceil(totalCount / itemsPerPage) : 1;
  const startIndex = totalCount ? (page - 1) * itemsPerPage + 1 : 0;
  const endIndex = totalCount
    ? Math.min(page * itemsPerPage, totalCount)
    : stores.length;

  if (stores.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("verifiedStores")}</CardTitle>
          <CardDescription>{t("verifiedStoresDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noVerifiedStores")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("verifiedStores")}</CardTitle>
        <CardDescription>{t("verifiedStoresDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.storeName")}</TableHead>
              <TableHead>{t("table.owner")}</TableHead>
              <TableHead>{t("verifiedAt")}</TableHead>
              <TableHead className="text-right">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.owner}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(store.verifiedAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <Check className="h-3 w-3" />
                      {t("verified")}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/stores/${store.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {t("viewDetails")}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/stores/${store.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        {t("editStore")}
                      </Link>
                    </Button>
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
                          {t("revokeVerification")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("revokeConfirmTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("revokeConfirmDesc", { name: store.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevoke(store.id)}>
                            {t("revokeVerification")}
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

        {/* Pagination */}
        {totalCount && totalCount > itemsPerPage && onPageChange && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("showingStores", {
                start: startIndex,
                end: endIndex,
                total: totalCount,
              })}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {(() => {
                  const pagesToShow: (number | string)[] = [];

                  // Always show first page
                  pagesToShow.push(1);

                  // Add ellipsis if needed before current page
                  if (page > 3) {
                    pagesToShow.push("ellipsis-start");
                  }

                  // Show pages around current page
                  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
                    if (!pagesToShow.includes(p)) {
                      pagesToShow.push(p);
                    }
                  }

                  // Add ellipsis if needed after current page
                  if (page < totalPages - 2) {
                    pagesToShow.push("ellipsis-end");
                  }

                  // Always show last page if more than 1 page
                  if (totalPages > 1 && !pagesToShow.includes(totalPages)) {
                    pagesToShow.push(totalPages);
                  }

                  return pagesToShow.map((p, idx) => {
                    if (p === "ellipsis-start" || p === "ellipsis-end") {
                      return (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(p as number);
                          }}
                          isActive={p === page}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    className={
                      page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

