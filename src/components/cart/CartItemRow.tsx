
import { CartItem } from "@/core/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { 
  MinusCircle, 
  PlusCircle, 
  Trash2,
  Palette,
  Ruler
} from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
}

const CartItemRow = ({ item, updateQuantity, removeFromCart }: CartItemRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-muted-foreground">{item.storeName}</div>
            <div className="md:hidden text-sm mt-1">${item.price.toFixed(2)}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">${item.price.toFixed(2)}</TableCell>
      <TableCell className="hidden md:table-cell">
        {item.size ? (
          <Badge variant="outline" className="text-xs">
            <Ruler className="h-3 w-3 mr-1" />
            {item.size}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">N/A</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {item.color ? (
          <Badge variant="outline" className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            {item.color}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          <div className="w-10 text-center">{item.quantity}</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-2"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        ${(item.price * item.quantity).toFixed(2)}
      </TableCell>
    </TableRow>
  );
};

export default CartItemRow;
