import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/core/types";

interface ProductCardProps extends Product {}

export const ProductCard = ({
  id,
  title,
  price,
  image,
  storeName,
  isNew = false,
  isFeatured = false,
  isSoldOut = false,
}: ProductCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = () => {
    if (isSoldOut) return;

    addToCart({
      productId: id,
      title,
      price,
      image,
      storeName,
      quantity: 1,
    });
  };

  const productInCart = isInCart(id);

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 border-border/40 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* Image loading skeleton */}
        {isLoading && !imageError && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Fallback image */}
        {imageError && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <img
                src="/uploads/696575bd-a3a7-49dd-8683-6f5a3a5f3092.png"
                alt="Cap silhouette"
                className="w-16 h-16 object-contain opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Image not available
              </p>
            </div>
          </div>
        )}

        {/* Product image */}
        {!imageError && (
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImageError(true);
            }}
            style={{ display: isLoading ? "none" : "block" }}
          />
        )}

        {/* Product badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge
              variant="default"
              className="bg-black text-white hover:bg-black/90"
            >
              New
            </Badge>
          )}
          {isFeatured && (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground"
            >
              Featured
            </Badge>
          )}
          {isSoldOut && (
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground"
            >
              Sold Out
            </Badge>
          )}
        </div>

        {/* Quick actions */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-3 flex justify-between transform transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>

          <Button
            disabled={isSoldOut}
            variant={productInCart ? "secondary" : "default"}
            size="sm"
            className="h-8"
            onClick={handleAddToCart}
          >
            {productInCart ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {isSoldOut ? "Sold Out" : "Add to Cart"}
              </>
            )}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{storeName}</div>
        <h3 className="font-medium text-base mb-1 line-clamp-1">{title}</h3>
        <div className="font-semibold">${price.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
