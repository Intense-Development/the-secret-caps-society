"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/core/types";
import { useCart } from "@/context/CartContext";
import ProductImageSection from "./product-detail/ProductImageSection";
import ProductDetailsSection from "./product-detail/ProductDetailsSection";
import RelatedProductsSection from "./product-detail/RelatedProductsSection";

interface ProductDetailDialogProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onViewRelatedProduct: (productId: string) => void;
}

const ProductDetailDialog = ({
  product,
  relatedProducts,
  onClose,
  onViewRelatedProduct,
}: ProductDetailDialogProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart, isInCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      storeName: product.storeName,
      quantity: 1,
      size: selectedSize || undefined,
    });
  };

  // Check if product with this specific size is already in cart
  const alreadyInCart = isInCart(product.id, selectedSize || undefined);

  // Updated to require selectedSize (size is mandatory)
  const canAddToCart = !product.isSoldOut && selectedSize && !alreadyInCart;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Product Image */}
          <ProductImageSection product={product} />

          {/* Product Details */}
          <ProductDetailsSection
            product={product}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            handleAddToCart={handleAddToCart}
            alreadyInCart={alreadyInCart}
            canAddToCart={canAddToCart}
          />
        </div>

        {/* Related Products Section */}
        <RelatedProductsSection
          relatedProducts={relatedProducts}
          onViewRelatedProduct={onViewRelatedProduct}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
