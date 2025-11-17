"use client";

import React, { useState } from "react";
import { Product } from "@/core/types";
import ProductImageFallback from "./ProductImageFallback";

interface ProductImageSectionProps {
  product: Product;
}

const ProductImageSection = ({ product }: ProductImageSectionProps) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageLoaded(false);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="rounded-md border overflow-hidden bg-muted/20">
      <div className="relative aspect-square">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {imageLoaded ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <ProductImageFallback />
        )}

        {product.isNew && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            New
          </div>
        )}
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <div className="bg-background/80 text-foreground text-sm font-medium px-4 py-2 rounded">
              Sold Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageSection;
