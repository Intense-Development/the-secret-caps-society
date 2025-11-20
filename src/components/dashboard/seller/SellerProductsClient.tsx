"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { ProductsTable } from "./ProductsTable";
import { ProductDialog } from "./ProductDialog";
import type { SellerProduct } from "@/application/products/seller/getSellerProducts";
import { toast } from "sonner";

interface SellerProductsClientProps {
  initialProducts: SellerProduct[];
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerProductsClient({
  initialProducts,
  storeId,
  stores,
}: SellerProductsClientProps) {
  const t = useTranslations("seller.products");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<SellerProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(
    storeId
  );
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  // Handle highlight query parameter from search
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId && products.length > 0) {
      const product = products.find((p) => p.id === highlightId);
      if (product) {
        setHighlightedProductId(highlightId);
        // Scroll to product after a short delay
        setTimeout(() => {
          const element = document.getElementById(`product-${highlightId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Remove highlight after 3 seconds
            setTimeout(() => {
              setHighlightedProductId(null);
              // Clean up URL
              const params = new URLSearchParams(searchParams.toString());
              params.delete("highlight");
              router.replace(`/dashboard/seller/products?${params.toString()}`);
            }, 3000);
          }
        }, 100);
      }
    }
  }, [searchParams, products, router]);

  // Get selected store from localStorage (set by SellerHeader)
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch products when store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchProducts(selectedStoreId);
    } else {
      setProducts([]);
    }
  }, [selectedStoreId]);

  const fetchProducts = async (storeId: string) => {
    try {
      const response = await fetch(`/api/seller/products?storeId=${storeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleRefresh = () => {
    if (selectedStoreId) {
      fetchProducts(selectedStoreId);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    return filtered;
  }, [products, searchQuery, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("selectedStoreId", newStoreId);
  };

  if (stores.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your products and inventory
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can add products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your products and inventory
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        storeId={selectedStoreId}
        onRefresh={handleRefresh}
        highlightedProductId={highlightedProductId}
      />

      {/* Create Dialog */}
      <ProductDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            handleRefresh();
          }
        }}
        product={null}
        storeId={selectedStoreId}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

