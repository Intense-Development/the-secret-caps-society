import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/core/types";

interface RelatedProductsSectionProps {
  relatedProducts: Product[];
  onViewRelatedProduct: (productId: string) => void;
}

const RelatedProductsSection = ({
  relatedProducts,
  onViewRelatedProduct,
}: RelatedProductsSectionProps) => {
  return (
    <div className="space-y-3 border-t pt-4">
      <Label>Related Products</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {relatedProducts.slice(0, 3).map((relatedProduct) => {
          const [imageError, setImageError] = useState(false);

          return (
            <div
              key={relatedProduct.id}
              className="cursor-pointer border rounded-md p-2 hover:border-primary transition-colors"
              onClick={() => onViewRelatedProduct(relatedProduct.id)}
            >
              <div className="aspect-square relative bg-muted/20 rounded mb-2 overflow-hidden">
                {imageError ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center p-2">
                      <img
                        src="/uploads/696575bd-a3a7-49dd-8683-6f5a3a5f3092.png"
                        alt="Cap silhouette"
                        className="w-12 h-12 object-contain opacity-60"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        No image
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}

                {relatedProduct.isSoldOut && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Badge variant="outline" className="bg-background/80">
                      Sold Out
                    </Badge>
                  </div>
                )}
              </div>
              <h4 className="text-sm font-medium truncate">
                {relatedProduct.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                ${relatedProduct.price.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProductsSection;
