import { Link } from "wouter";
import { Star, StarHalf, ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();
  
  const renderRatingStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 text-amber-500 fill-current" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-amber-500" />
        ))}
      </div>
    );
  };
  
  const addToCart = async () => {
    try {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1
      });
      
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: t('products.add_to_cart_success'),
        description: `${product.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {/* Product Image with Badges */}
      <div className="relative overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || ''} 
          alt={product.name}
          className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 right-0 p-2 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-primary hover:bg-primary">{t('products.featured')}</Badge>
          )}
          {product.inStock ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {t('products.in_stock')}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              {t('products.low_stock')}
            </Badge>
          )}
        </div>
        
        {/* Quick action buttons overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full p-2"
              onClick={() => window.location.href = `/products/${product.slug}`}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">{t('products.view_details')}</span>
            </Button>
            <Button 
              size="sm" 
              className="rounded-full p-2"
              onClick={addToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">{t('common.add_to_cart')}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-primary transition cursor-pointer line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          {renderRatingStars(product.rating || '0')}
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>
        
        {product.material && (
          <div className="my-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.material}
            </span>
          </div>
        )}
        
        <p className="text-base font-bold text-gray-900 mt-auto pt-3">
          {formatPrice(Number(product.price), { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}
        </p>
        
        <div className="mt-3">
          <Button 
            onClick={addToCart}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            {t('common.add_to_cart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
