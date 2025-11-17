
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/AnimatedSection";

interface ProductsHeroProps {
  onSearchChange: (value: string) => void;
}

export const ProductsHero = ({ onSearchChange }: ProductsHeroProps) => {
  return (
    <section className="bg-secondary/50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <AnimatedSection animation="slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Premium Caps
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Browse our curated collection of authentic caps from verified
            resellers.
          </p>
        </AnimatedSection>

        {/* Search bar */}
        <div className="mt-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search caps..."
              className="pl-9 bg-background"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsHero;
