"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CartIndicator = () => {
  const { cart } = useCart();

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {cart.totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
            {cart.totalItems}
          </Badge>
        )}
        <span className="sr-only">View cart</span>
      </Button>
    </Link>
  );
};

export default CartIndicator;
