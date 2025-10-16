
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailDialog from "@/components/ProductDetailDialog";
import { Product } from "@/core/types";

// Import refactored components
import ProductsHero from "@/components/products/ProductsHero";
import ProductsFilters from "@/components/products/ProductsFilters";
import ProductsSort from "@/components/products/ProductsSort";
import ProductsGrid from "@/components/products/ProductsGrid";
import MobileFilterBar from "@/components/products/MobileFilterBar";
import { PRODUCTS, getRelatedProducts } from "@/components/products/ProductsData";

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([20, 60]);
  const [sortOption, setSortOption] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Function to handle viewing a product's details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };
  
  // Function to handle selecting a related product
  const handleViewRelatedProduct = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  // Function to trigger filter application
  const applyFilters = () => {
    console.log("Applying filters with price range:", priceRange);
    // The actual filtering happens in the useEffect below
  };

  // Apply filters whenever search query or other filters change
  useEffect(() => {
    let filtered = PRODUCTS;
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.storeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortOption) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Assuming new products are at the beginning of the array
        // In a real app, you would sort by a date field
        break;
      default:
        break;
    }
    
    console.log(`Found ${filtered.length} products after filtering`);
    setFilteredProducts(filtered);
  }, [searchQuery, priceRange, sortOption]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 md:pt-24">
        {/* Hero section with search */}
        <ProductsHero onSearchChange={setSearchQuery} />
        
        {/* Products grid with filters */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters - Desktop and Mobile */}
              <ProductsFilters
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                isFilterOpen={isFilterOpen}
                toggleFilters={toggleFilters}
                onApplyFilters={applyFilters}
              />
              
              {/* Mobile Filters Button and Sort */}
              <MobileFilterBar
                toggleFilters={toggleFilters}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
              
              {/* Products Content Area */}
              <div className="flex-1">
                {/* Sort options - Desktop */}
                <ProductsSort
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  productsCount={filteredProducts.length}
                  isDesktop={true}
                />
                
                {/* Products grid with filtered products */}
                <ProductsGrid
                  products={filteredProducts}
                  onProductClick={handleViewProduct}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        relatedProducts={getRelatedProducts(selectedProduct, PRODUCTS)}
        onClose={() => setSelectedProduct(null)}
        onViewRelatedProduct={handleViewRelatedProduct}
      />
      
      <Footer />
    </div>
  );
};

export default Products;
