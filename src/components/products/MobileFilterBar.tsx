
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import ProductsSort from "./ProductsSort";

interface MobileFilterBarProps {
  toggleFilters: () => void;
  sortOption: string;
  setSortOption: (value: string) => void;
}

export const MobileFilterBar = ({ 
  toggleFilters, 
  sortOption, 
  setSortOption 
}: MobileFilterBarProps) => {
  return (
    <div className="lg:hidden sticky top-16 z-30 bg-background/80 backdrop-blur-sm py-3 border-b">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={toggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <ProductsSort 
            sortOption={sortOption} 
            setSortOption={setSortOption} 
            productsCount={0} 
            isDesktop={false} 
          />
        </div>
      </div>
    </div>
  );
};

export default MobileFilterBar;
