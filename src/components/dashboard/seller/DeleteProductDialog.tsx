"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { SellerProduct } from "@/application/products/seller/getSellerProducts";

interface DeleteProductDialogProps {
  product: SellerProduct;
  storeId: string | null;
  onClose: () => void;
}

export function DeleteProductDialog({
  product,
  storeId,
  onClose,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!storeId) {
      toast.error("No store selected");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/seller/products/${product.id}?storeId=${storeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      toast.success("Product deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete product. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product <strong>{product.name}</strong> from your store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

