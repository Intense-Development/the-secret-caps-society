"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: "1",
    title: "New York Yankees Navy 59FIFTY Fitted",
    price: 45.99,
    image:
      "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "NYC Cap Co.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "LA Dodgers Black 59FIFTY Fitted",
    price: 42.99,
    image:
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    storeName: "West Coast Caps",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Chicago Bulls Red 59FIFTY Fitted",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1584724108142-8a48ac774673?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80",
    storeName: "Windy City Headwear",
    isFeatured: true,
  },
  {
    id: "4",
    title: "Boston Red Sox Green 59FIFTY Fitted",
    price: 44.99,
    image:
      "https://images.unsplash.com/photo-1595118802-9a161f3af291?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2530&q=80",
    storeName: "East Coast Caps",
    isSoldOut: true,
    isFeatured: true,
  },
  {
    id: "5",
    title: "Atlanta Braves Red 59FIFTY Fitted",
    price: 41.99,
    image:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2680&q=80",
    storeName: "South Cap Depot",
  },
  {
    id: "6",
    title: "Miami Marlins Teal 59FIFTY Fitted",
    price: 43.99,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80",
    storeName: "South Cap Depot",
    isNew: true,
  },
  {
    id: "7",
    title: "Philadelphia Phillies Red 59FIFTY Fitted",
    price: 40.99,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&q=80",
    storeName: "East Coast Caps",
  },
  {
    id: "8",
    title: "Oakland A's Green 59FIFTY Fitted",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1528&q=80",
    storeName: "West Coast Caps",
  },
];

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [filters, setFilters] = useState({
    inStock: false,
    newArrivals: false,
    featured: false,
  });

  useEffect(() => {
    const storeId = searchParams.get("store");

    let filtered = MOCK_PRODUCTS;

    // Filter by store if provided
    if (storeId) {
      // This would be a real API call in a production application
      // For now, we'll just pretend to filter by store
      filtered = filtered.filter(
        (_, index) => index % 2 === Number(storeId) % 2
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.storeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply other filters
    if (filters.inStock) {
      filtered = filtered.filter((product) => !product.isSoldOut);
    }

    if (filters.newArrivals) {
      filtered = filtered.filter((product) => product.isNew);
    }

    if (filters.featured) {
      filtered = filtered.filter((product) => product.isFeatured);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceRange, filters, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          {searchParams.get("store") && (
            <div className="mb-6">
              <Link
                href="/stores"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Stores
              </Link>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
            <p className="text-muted-foreground">
              {searchParams.get("store")
                ? "Viewing products from selected store"
                : "Discover premium caps from our verified resellers"}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters - Desktop */}
            <div className="hidden lg:block w-64 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">${priceRange[0]}</span>
                      <span className="text-sm">${priceRange[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Availability</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            inStock: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="in-stock" className="text-sm font-normal">
                        In Stock
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Product Status</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-arrivals"
                        checked={filters.newArrivals}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            newArrivals: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="new-arrivals"
                        className="text-sm font-normal"
                      >
                        New Arrivals
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.featured}
                        onCheckedChange={(checked) =>
                          setFilters({
                            ...filters,
                            featured: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="featured" className="text-sm font-normal">
                        Featured
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products */}
            <div className="flex-1">
              {/* Search and Mobile Filter Controls */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6">
                  <Card>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Price Range</h3>
                        <Slider
                          defaultValue={[0, 100]}
                          max={100}
                          step={1}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">${priceRange[0]}</span>
                          <span className="text-sm">${priceRange[1]}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Availability</h3>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="in-stock-mobile"
                            checked={filters.inStock}
                            onCheckedChange={(checked) =>
                              setFilters({
                                ...filters,
                                inStock: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="in-stock-mobile"
                            className="text-sm font-normal"
                          >
                            In Stock
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Product Status</h3>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="new-arrivals-mobile"
                            checked={filters.newArrivals}
                            onCheckedChange={(checked) =>
                              setFilters({
                                ...filters,
                                newArrivals: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="new-arrivals-mobile"
                            className="text-sm font-normal"
                          >
                            New Arrivals
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featured-mobile"
                            checked={filters.featured}
                            onCheckedChange={(checked) =>
                              setFilters({
                                ...filters,
                                featured: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor="featured-mobile"
                            className="text-sm font-normal"
                          >
                            Featured
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No products match your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPriceRange([0, 100]);
                      setFilters({
                        inStock: false,
                        newArrivals: false,
                        featured: false,
                      });
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Loading fallback component
const ProductsPageLoading = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPage />
    </Suspense>
  );
}
