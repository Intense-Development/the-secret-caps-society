
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { Product } from "@/core/types";

interface ProductsGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export const ProductsGrid = ({ products, onProductClick }: ProductsGridProps) => {
  return (
    <div className="flex-1">
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <AnimatedSection
            key={product.id}
            animation="slide-up"
            delay={100 + index * 50}
          >
            <div onClick={() => onProductClick(product)}>
              <ProductCard {...product} />
            </div>
          </AnimatedSection>
        ))}
      </div>
      
      {/* Load more button */}
      <div className="mt-12 text-center">
        <Button variant="outline" size="lg">
          Load More
        </Button>
      </div>
    </div>
  );
};

export default ProductsGrid;
