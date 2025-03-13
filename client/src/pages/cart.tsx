import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  ShoppingBagIcon, 
  Trash2, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import CartItemComponent from "@/components/cart-item";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  
  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ['/api/cart'],
  });
  
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price.toString());
      return total + (price * item.quantity);
    }, 0);
  };
  
  const calculateTaxes = (subtotal: number) => {
    // Example tax rate of 7%
    return subtotal * 0.07; 
  };
  
  const calculateShipping = (subtotal: number) => {
    // Free shipping over $75, otherwise $8.95
    return subtotal > 75 ? 0 : 8.95;
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const shipping = calculateShipping(subtotal);
    
    return subtotal + taxes + shipping;
  };
  
  const clearCart = async () => {
    if (!cartItems || cartItems.length === 0) return;
    
    setIsClearing(true);
    try {
      await apiRequest('DELETE', '/api/cart', undefined);
      
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  const goToCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }
    
    setLocation("/checkout");
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
              <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
            </div>
            <div>
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Cart</h2>
            <p className="text-gray-600 mb-6">
              We encountered a problem loading your shopping cart. Please try again.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isEmpty = !cartItems || cartItems.length === 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-500 mt-1">
          {isEmpty ? 'Your cart is empty' : `You have ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`}
        </p>
      </div>
      
      {isEmpty ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCart}
                  disabled={isClearing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation("/products")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setLocation("/calculator")}
                >
                  Custom 3D Print
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {calculateShipping(calculateSubtotal()) === 0 
                        ? 'Free' 
                        : `$${calculateShipping(calculateSubtotal()).toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (estimated)</span>
                    <span>${calculateTaxes(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={goToCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-4">
              <CardContent className="p-4 text-sm">
                <p className="font-medium mb-2">We Accept</p>
                <div className="flex space-x-2">
                  <div className="p-2 border rounded bg-gray-50">Visa</div>
                  <div className="p-2 border rounded bg-gray-50">MasterCard</div>
                  <div className="p-2 border rounded bg-gray-50">PayPal</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
