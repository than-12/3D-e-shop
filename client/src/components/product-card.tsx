import { Link } from "wouter";
import { Star, StarHalf } from "lucide-react";
import { Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();
  
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
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
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
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 w-full overflow-hidden">
        <img 
          src={product.imageUrl || ''} 
          alt={product.name}
          className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-primary hover:bg-primary">Popular</Badge>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">
          <Link href={`/products/${product.slug}`}>
            <a>
              <span aria-hidden="true" className="absolute inset-0"></span>
              {product.name}
            </a>
          </Link>
        </h3>
        
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        
        <div className="mt-3 flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">${product.price}</p>
          <div className="text-sm text-gray-500 flex items-center">
            {renderRatingStars(product.rating || '0')}
            <span className="ml-1">({product.reviewCount || 0})</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2 text-sm">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {product.material}
          </Badge>
          <Badge variant="outline" className={`${product.inStock ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} hover:bg-green-100`}>
            {product.inStock ? 'In Stock' : 'Low Stock'}
          </Badge>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart();
          }}
          className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
