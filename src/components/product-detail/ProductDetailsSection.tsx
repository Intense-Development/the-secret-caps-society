import React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layers, ShoppingCart } from "lucide-react";
import { Product } from "@/core/types";

interface ProductDetailsSectionProps {
  product: Product;
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  handleAddToCart: () => void;
  alreadyInCart: boolean;
  canAddToCart: boolean;
}

const ProductDetailsSection = ({
  product,
  selectedSize,
  setSelectedSize,
  handleAddToCart,
  alreadyInCart,
  canAddToCart,
}: ProductDetailsSectionProps) => {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">
            ${product.price.toFixed(2)}
          </span>
          {product.isNew && (
            <Badge className="bg-primary hover:bg-primary/90">New</Badge>
          )}
          {product.isSoldOut && (
            <Badge variant="outline" className="text-red-500 border-red-200">
              Sold Out
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">From: {product.storeName}</p>
      </div>

      {/* Sizes Section */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Label>
            Available Sizes <span className="text-red-500">*</span>
          </Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {["7", "7 1/8", "7 1/4", "7 3/8", "7 1/2"].map((size) => (
            <button
              key={size}
              onClick={() =>
                setSelectedSize(size === selectedSize ? null : size)
              }
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                selectedSize === size
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
              disabled={product.isSoldOut}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedSize ? (
          <p className="text-sm text-muted-foreground mt-1">
            Selected size: {selectedSize}
          </p>
        ) : (
          <p className="text-sm text-red-500 mt-1">Please select a size</p>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="border-t pt-4">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {alreadyInCart
            ? "In Cart"
            : product.isSoldOut
            ? "Sold Out"
            : !selectedSize
            ? "Size Required"
            : "Add to Cart"}
        </Button>
        {!selectedSize && !product.isSoldOut && !alreadyInCart && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Please select a size to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsSection;
