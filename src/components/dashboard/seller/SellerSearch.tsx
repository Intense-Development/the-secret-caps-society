"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Loader2, Package, ShoppingBag, User } from "lucide-react";
import { Link } from "@/i18n/routing-config";

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  type: "product" | "order" | "customer";
}

export function SellerSearch() {
  const t = useTranslations("seller.search");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Get store from localStorage
  useEffect(() => {
    const storeId = localStorage.getItem("selectedStoreId");
    setSelectedStoreId(storeId);
  }, []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      if (!selectedStoreId) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/seller/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            storeId: selectedStoreId,
            limit: 10,
          }),
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        if (data.success) {
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedStoreId]
  );

  useEffect(() => {
    if (debouncedQuery && selectedStoreId) {
      search(debouncedQuery);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, search, selectedStoreId]);

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "order":
        return <ShoppingBag className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getResultUrl = (result: SearchResult) => {
    switch (result.type) {
      case "product":
        return `/dashboard/seller/products?highlight=${result.id}`;
      case "order":
        return `/dashboard/seller/orders/${result.id}`;
      case "customer":
        return `/dashboard/seller/orders?customer=${result.id}`;
      default:
        return "#";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("loading")}
            </span>
          </div>
        ) : results.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={getResultUrl(result)}
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
              >
                <div className="flex-shrink-0 text-muted-foreground">
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.name}</p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {result.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-muted-foreground capitalize">
                    {result.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : debouncedQuery ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

