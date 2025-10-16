
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsSortProps {
  sortOption: string;
  setSortOption: (value: string) => void;
  productsCount: number;
  isDesktop?: boolean;
}

export const ProductsSort = ({ 
  sortOption, 
  setSortOption, 
  productsCount,
  isDesktop = true 
}: ProductsSortProps) => {
  return (
    <>
      {isDesktop ? (
        <div className="hidden lg:flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{productsCount}</span> products
            </p>
          </div>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      )}
    </>
  );
};

export default ProductsSort;
