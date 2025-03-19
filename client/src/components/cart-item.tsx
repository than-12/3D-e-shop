import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItem & { product: Product };
}

const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'%3EΧωρίς εικόνα%3C/text%3E%3C/svg%3E";

// Προσθήκη προεπιλεγμένης εικόνας για 3D μοντέλα
const defaultCustomPrintImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e6f2ff'/%3E%3Cpath d='M50 20 L80 65 L50 80 L20 65 Z' fill='%234da6ff' stroke='%231a75ff' stroke-width='2'/%3E%3Cpath d='M50 20 L50 80' stroke='%231a75ff' stroke-width='1' stroke-dasharray='3,2'/%3E%3Cpath d='M20 65 L80 65' stroke='%231a75ff' stroke-width='1' stroke-dasharray='3,2'/%3E%3Ctext x='50' y='95' font-family='Arial' font-size='10' text-anchor='middle' fill='%23333333'%3E3D Μοντέλο%3C/text%3E%3C/svg%3E";

// Βοηθητική συνάρτηση για σωστή σύνθεση των URLs
const buildImageUrl = (baseUrl: string, imagePath: string | null): string => {
  if (!imagePath) return placeholderSvg;
  
  // Αν είναι data URL (screenshot από 3D μοντέλο), το επιστρέφουμε ως έχει
  if (imagePath.startsWith('data:image/')) {
    console.log("Using data URL directly");
    return imagePath;
  }
  
  // Αν είναι ήδη πλήρες URL
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Αν είναι σχετικό URL, φροντίζουμε να μην έχουμε διπλές καθέτους
  const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${basePath}${path}`;
};

const CartItemComponent = ({ item }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => {
    const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
    
    console.log("Initializing imgSrc with:", {
      productImageUrl: item.product.imageUrl,
      photoUrl: item.photoUrl,
      photoUrlType: item.photoUrl ? (item.photoUrl.startsWith('data:') ? 'data URL' : 'regular URL') : 'null',
      photoUrlLength: item.photoUrl ? item.photoUrl.length : 0,
      customPrintId: item.customPrintId,
      serverUrl
    });

    // Αν είναι custom print, χρησιμοποιούμε το photoUrl
    if (item.customPrintId && item.photoUrl) {
      console.log("Custom print detected with photoUrl:", 
        item.photoUrl.startsWith('data:') ? `${item.photoUrl.substring(0, 50)}...` : item.photoUrl);
      return buildImageUrl(serverUrl, item.photoUrl);
    }
    
    // Αν είναι custom print χωρίς photoUrl, χρησιμοποιούμε την προεπιλεγμένη εικόνα 3D μοντέλου
    if (item.customPrintId) {
      console.log("Custom print detected without photoUrl, using default 3D model image");
      return defaultCustomPrintImage;
    }

    // Για κανονικά προϊόντα, χρησιμοποιούμε το imageUrl
    console.log("Regular product, using imageUrl:", item.product.imageUrl);
    return buildImageUrl(serverUrl, item.product.imageUrl);
  });

  // Προσθήκη useEffect για να ενημερώνουμε το imgSrc όταν αλλάζει το item
  useEffect(() => {
    const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
    
    console.log("Item changed, updating imgSrc:", {
      productImageUrl: item.product.imageUrl,
      photoUrl: item.photoUrl,
      customPrintId: item.customPrintId,
      serverUrl
    });

    // Αν είναι custom print, χρησιμοποιούμε το photoUrl
    if (item.customPrintId && item.photoUrl) {
      console.log("Custom print detected with photoUrl:", item.photoUrl);
      setImgSrc(buildImageUrl(serverUrl, item.photoUrl));
      return;
    }
    
    // Αν είναι custom print χωρίς photoUrl, χρησιμοποιούμε την προεπιλεγμένη εικόνα 3D μοντέλου
    if (item.customPrintId) {
      console.log("Custom print detected without photoUrl, using default 3D model image");
      setImgSrc(defaultCustomPrintImage);
      return;
    }

    // Για κανονικά προϊόντα, χρησιμοποιούμε το imageUrl
    console.log("Regular product, using imageUrl:", item.product.imageUrl);
    setImgSrc(buildImageUrl(serverUrl, item.product.imageUrl));
  }, [item]);

  // Προσθήκη useEffect για παρακολούθηση αλλαγών στο imgSrc
  useEffect(() => {
    console.log("imgSrc changed:", {
      imgSrc,
      isPlaceholder: imgSrc === placeholderSvg,
      isDefaultCustomPrint: imgSrc === defaultCustomPrintImage,
      customPrintId: item.customPrintId
    });
  }, [imgSrc, item.customPrintId]);

  // Προσθήκη useEffect για έλεγχο αν η εικόνα υπάρχει στο server
  useEffect(() => {
    // Παραλείπουμε τα data URLs και placeholders
    if (imgSrc === placeholderSvg || imgSrc === defaultCustomPrintImage || imgSrc.startsWith('data:')) {
      return;
    }
    
    // Έλεγχος αν η εικόνα υπάρχει
    const checkImageExists = async (url: string) => {
      try {
        console.log("Checking if image exists:", url);
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Image does not exist at ${url}. Status: ${response.status}`);
          // Αν είναι custom print και έχουμε photoUrl που είναι data URL, δοκιμάζουμε να το χρησιμοποιήσουμε απευθείας
          if (item.customPrintId && item.photoUrl && item.photoUrl.startsWith('data:')) {
            console.log("Using data URL directly for custom print");
            setImgSrc(item.photoUrl);
          } else {
            // Αλλιώς χρησιμοποιούμε το fallback
            setImgSrc(item.customPrintId ? defaultCustomPrintImage : placeholderSvg);
          }
        } else {
          console.log(`Image exists at ${url}`);
        }
      } catch (error) {
        console.error(`Error checking image at ${url}:`, error);
        // Αν είναι custom print και έχουμε photoUrl που είναι data URL, δοκιμάζουμε να το χρησιμοποιήσουμε απευθείας
        if (item.customPrintId && item.photoUrl && item.photoUrl.startsWith('data:')) {
          console.log("Using data URL directly for custom print after error");
          setImgSrc(item.photoUrl);
        } else {
          // Αλλιώς χρησιμοποιούμε το fallback
          setImgSrc(item.customPrintId ? defaultCustomPrintImage : placeholderSvg);
        }
      }
    };
    
    checkImageExists(imgSrc);
  }, [imgSrc, item.customPrintId, item.photoUrl]);

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
          key={imgSrc}
          src={imgSrc}
          alt={item.product.name}
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            const imgElement = e.target as HTMLImageElement;
            console.error("Image load error details:", {
              currentSrc: imgElement.src,
              productName: item.product.name,
              productId: item.product.id,
              customPrintId: item.customPrintId,
              isPlaceholder: imgElement.src === placeholderSvg,
              isDefaultCustomPrint: imgElement.src === defaultCustomPrintImage,
              imgSrc,
              photoUrl: item.photoUrl,
              productImageUrl: item.product.imageUrl
            });
            
            // Αν η εικόνα έχει ήδη το placeholder ή την προεπιλεγμένη εικόνα 3D μοντέλου, απλά κρύψε το σφάλμα
            if (imgElement.src === placeholderSvg || imgElement.src === defaultCustomPrintImage) {
              return;
            }
            
            // Αλλαγή σε placeholder ή προεπιλεγμένη εικόνα 3D μοντέλου
            console.log("Switching to fallback image");
            setImgSrc(item.customPrintId ? defaultCustomPrintImage : placeholderSvg);
          }}
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
