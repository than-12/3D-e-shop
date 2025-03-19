import { useState, useEffect } from "react";
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
import { useLanguage } from "@/hooks/use-language";

// Πλήρης ορισμός τύπου CartItem
interface CartItem {
  id: number;
  userId: number | null;
  productId: number | null;
  customPrintId: number | null;
  quantity: number;
  photoUrl: string | null;
  addedAt: Date | null;
  product: {
    id: number;
    name: string;
    price: string | number;
    description: string | null;
    imageUrl: string | null;
    // πρόσθεσε άλλες ιδιότητες ανάλογα με τις ανάγκες
  };
}

const Cart = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isClearing, setIsClearing] = useState(false);
  
  const { data: cartItems = [], isLoading, error, refetch } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    retry: 3
  });
  
  // Χειρισμός σφαλμάτων με useEffect
  useEffect(() => {
    if (error) {
      console.error("Σφάλμα φόρτωσης καλαθιού:", error);
      toast({
        title: "Σφάλμα φόρτωσης καλαθιού",
        description: "Παρουσιάστηκε πρόβλημα κατά τη φόρτωση του καλαθιού σας. Προσπαθήστε να ανανεώσετε τη σελίδα.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Κουμπί επαναφόρτωσης καλαθιού
  const handleRetryLoad = () => {
    refetch().catch(err => {
      console.error("Σφάλμα επαναφόρτωσης καλαθιού:", err);
      toast({
        title: "Αποτυχία επαναφόρτωσης",
        description: "Δεν ήταν δυνατή η επαναφόρτωση του καλαθιού. Προσπαθήστε αργότερα.",
        variant: "destructive",
      });
    });
  };
  
  console.log("Cart data in cart component:", cartItems);
  
  const calculateSubtotal = () => {
    if (!cartItems?.length) return 0;
    
    return cartItems.reduce((total, item) => {
      const itemPrice = parseFloat(typeof item.product.price === 'string' ? item.product.price : item.product.price.toString());
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  const calculateTaxes = (subtotal: number) => {
    // 24% ΦΠΑ
    return subtotal * 0.24;
  };
  
  const calculateShipping = (subtotal: number) => {
    // Δωρεάν μεταφορικά για παραγγελίες άνω των 50€
    return subtotal > 50 ? 0 : 4.99;
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxes = calculateTaxes(subtotal);
    const shipping = calculateShipping(subtotal);
    
    return subtotal + taxes + shipping;
  };
  
  const clearCart = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      await apiRequest('DELETE', '/api/cart', undefined);
      
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Καλάθι καθαρίστηκε",
        description: "Όλα τα προϊόντα αφαιρέθηκαν από το καλάθι σας.",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία εκκαθάρισης του καλαθιού. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  const goToCheckout = () => {
    setLocation('/checkout');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShoppingBagIcon className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <h2 className="text-2xl font-semibold mt-4">{t('cart.loading')}</h2>
          <p className="text-muted-foreground">{t('cart.please_wait')}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
            <CardTitle className="text-2xl">{t('cart.error_loading')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6">
              {t('cart.cart_load_failed')}
            </p>
            <div className="flex justify-center">
              <Button onClick={handleRetryLoad}>
                {t('cart.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <ShoppingBagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle className="text-2xl">{t('cart.empty_cart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6">
              {t('cart.no_items')}
            </p>
            <div className="flex justify-center">
              <Link href="/products">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('cart.continue_shopping')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">{t('cart.your_cart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{t('cart.items')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('cart.clearing')}
                    </span>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('cart.clear_cart')}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex justify-between">
              <Link href="/products">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('cart.continue_shopping')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('cart.order_summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span>{calculateSubtotal().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.tax')}</span>
                  <span>{calculateTaxes(calculateSubtotal()).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.shipping')}</span>
                  <span>
                    {calculateShipping(calculateSubtotal()) === 0 
                      ? t('cart.free') 
                      : `${calculateShipping(calculateSubtotal()).toFixed(2)} €`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{calculateTotal().toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={goToCheckout}>
                {t('cart.checkout')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
