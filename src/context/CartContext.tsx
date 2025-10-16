
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Cart } from "@/core/types";
import { toast } from "@/hooks/use-toast";

interface CartContextProps {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, size?: string, color?: string) => boolean;
}

const initialCartState: Cart = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>(initialCartState);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate totals whenever cart items change
  const calculateTotals = (items: CartItem[]): Cart => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      items,
      totalItems,
      totalPrice
    };
  };

  // Generate a unique identifier for cart items based on productId, size, and color
  const getItemUniqueKey = (item: Omit<CartItem, 'id'>) => {
    return `${item.productId}-${item.size || 'no-size'}-${item.color || 'no-color'}`;
  };

  // Add item to cart
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      const itemUniqueKey = getItemUniqueKey(item);
      
      // Find if an item with same productId, size and color exists
      const existingItemIndex = prevCart.items.findIndex(cartItem => 
        getItemUniqueKey(cartItem) === itemUniqueKey
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Item with same productId, size and color already exists, update quantity
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        toast({
          title: "Quantity updated",
          description: `${item.title} quantity increased in your cart`,
        });
      } else {
        // Add new item with a unique ID
        const newItem: CartItem = {
          ...item,
          id: `cart-${itemUniqueKey}-${Date.now()}`
        };
        updatedItems = [...prevCart.items, newItem];
        toast({
          title: "Added to cart",
          description: `${item.title} added to your cart`,
        });
      }

      return calculateTotals(updatedItems);
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== productId);
      
      toast({
        title: "Removed from cart",
        description: "Item removed from your cart",
      });
      
      return calculateTotals(updatedItems);
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      
      return calculateTotals(updatedItems);
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart(initialCartState);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  // Check if product is in cart with the same size and color
  const isInCart = (productId: string, size?: string, color?: string): boolean => {
    if (!size && !color) {
      // If no size or color is provided, use the old behavior
      return cart.items.some(item => item.productId === productId);
    }
    
    // Check for a specific combination of product, size, and color
    return cart.items.some(item => 
      item.productId === productId && 
      item.size === size && 
      (color ? item.color === color : true)
    );
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
