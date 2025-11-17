"use client";

import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import AnimatedSection from "./AnimatedSection";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFeaturedProducts } from "@/application/products/getFeaturedProducts";
import { useQuery } from "@tanstack/react-query";

export const FeaturedProducts = () => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: getFeaturedProducts,
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Failed to load featured products.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <AnimatedSection animation="slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Featured Products
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Explore the highest quality caps from our verified resellers.
              </p>
            </div>
            <Link href="/products" className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products &&
            products.map((product, index) => (
              <AnimatedSection
                key={product.id}
                animation="slide-up"
                delay={100 + index * 100}
              >
                <ProductCard {...product} />
              </AnimatedSection>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
