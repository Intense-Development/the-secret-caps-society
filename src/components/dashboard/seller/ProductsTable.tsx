"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import type { SellerProduct } from "@/application/products/seller/getSellerProducts";
import { ProductDialog } from "./ProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface ProductsTableProps {
  products: SellerProduct[];
  storeId: string | null;
  onRefresh: () => void;
}

export function ProductsTable({
  products,
  storeId,
  onRefresh,
}: ProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(
    null
  );
  const [deletingProduct, setDeletingProduct] = useState<SellerProduct | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleEdit = (product: SellerProduct) => {
    setEditingProduct(product);
  };

  const handleDelete = (product: SellerProduct) => {
    setDeletingProduct(product);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingProduct(null);
    setIsCreateDialogOpen(false);
    onRefresh();
  };

  const handleDeleteClose = () => {
    setDeletingProduct(null);
    onRefresh();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found. Create your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category || (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock === 0
                          ? "destructive"
                          : product.stock < 10
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.archived ? (
                      <Badge variant="outline">Archived</Badge>
                    ) : product.is_featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(product)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Navigate to product detail page
                            window.open(`/products/${product.id}`, "_blank");
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <ProductDialog
        open={isCreateDialogOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
        }}
        product={editingProduct}
        storeId={storeId}
        onSuccess={handleDialogClose}
      />

      {/* Delete Dialog */}
      {deletingProduct && (
        <DeleteProductDialog
          product={deletingProduct}
          storeId={storeId}
          onClose={handleDeleteClose}
        />
      )}
    </>
  );
}

