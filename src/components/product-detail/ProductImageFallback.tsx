import React from "react";

const ProductImageFallback = ({ className }: { className?: string }) => {
  return (
    <div
      className={`flex items-center justify-center bg-muted h-full w-full ${className}`}
    >
      <div className="flex flex-col items-center justify-center p-4">
        <img
          src="/uploads/696575bd-a3a7-49dd-8683-6f5a3a5f3092.png"
          alt="Cap silhouette"
          className="w-24 h-24 object-contain opacity-60"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Image not available
        </p>
      </div>
    </div>
  );
};

export default ProductImageFallback;
