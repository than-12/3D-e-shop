import { useState } from "react";
import { Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItem & { product: Product };
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue > 0) {
      setQuantity(newValue);
    }
  };
  
  const updateQuantity = async () => {
    if (quantity === item.quantity) return;
    
    setIsUpdating(true);
    try {
      await apiRequest('PATCH', `/api/cart/${item.id}`, { quantity });
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Cart updated",
        description: `Quantity updated for ${item.product.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
      // Reset to original quantity on error
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const removeItem = async () => {
    setIsUpdating(true);
    try {
      await apiRequest('DELETE', `/api/cart/${item.id}`, undefined);
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Item removed",
        description: `${item.product.name} has been removed from your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex items-center py-6 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img 
          src={item.product.imageUrl || ''} 
          alt={item.product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.product.name}</h3>
            <p className="ml-4">${parseFloat(item.product.price.toString()).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.product.material}</p>
        </div>
        
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 mr-3">Qty</span>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={updateQuantity}
              className="w-16 h-8"
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={removeItem}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
