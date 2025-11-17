
import { useState } from "react";
import { Cart } from "@/core/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface CartSummaryProps {
  cart: Cart;
}

const CartSummary = ({ cart }: CartSummaryProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    // Set loading state
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Checkout initiated",
        description: "Redirecting to payment gateway...",
      });
      
      // Reset loading state
      setIsCheckingOut(false);
      
      // For now, we'll just show a success message
      // In a real implementation, this would redirect to Stripe or another payment processor
      setTimeout(() => {
        toast({
          title: "Demo mode",
          description: "This is a demo. Stripe integration will be added after Supabase connection.",
        });
      }, 1500);
    }, 1000);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cart.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline">Apply</Button>
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${cart.totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleCheckout}
            disabled={isCheckingOut || cart.items.length === 0}
          >
            {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CartSummary;
