import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  StarHalf,
  Minus,
  Plus,
  Share2
} from "lucide-react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });
  
  // Redirect to products page if product not found
  useEffect(() => {
    if (error) {
      toast({
        title: "Product not found",
        description: "The product you're looking for couldn't be found.",
        variant: "destructive",
      });
      setLocation("/products");
    }
  }, [error, setLocation, toast]);
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const renderRatingStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 text-amber-500 fill-current" />}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-amber-500" />
        ))}
      </div>
    );
  };
  
  const addToCart = async () => {
    if (!product) return;
    
    try {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity
      });
      
      // Invalidate cart query to refresh the cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
      
      // Reset quantity
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-6 w-36 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return null; // This state should be brief before the redirect happens
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="pl-0" 
          onClick={() => setLocation("/products")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {/* Main image */}
              <CarouselItem>
                <div className="p-1">
                  <div className="relative aspect-square overflow-hidden rounded-lg">
                    <img 
                      src={product.imageUrl || ''} 
                      alt={product.name} 
                      className="object-cover w-full h-full" 
                    />
                    {product.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary hover:bg-primary">Popular</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
              
              {/* Additional images if available */}
              {product.images && product.images.length > 1 && 
                product.images.slice(1).map((img, idx) => (
                  <CarouselItem key={idx}>
                    <div className="p-1">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img 
                          src={img} 
                          alt={`${product.name} - view ${idx + 2}`} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))
              }
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.map((img, idx) => (
                <button key={idx} className="border-2 border-transparent hover:border-primary rounded-md overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="aspect-square object-cover w-full" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="mt-2 flex items-center">
            {renderRatingStars(product.rating || '0')}
            <span className="ml-2 text-gray-500">
              {product.reviewCount || 0} reviews
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">${parseFloat(product.price.toString()).toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500">
              Includes standard shipping and handling
            </p>
          </div>
          
          <div className="mt-6">
            <p className="text-base text-gray-700">{product.description}</p>
          </div>
          
          <div className="mt-6 flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              {product.material}
            </Badge>
            <Badge variant="outline" className={`${product.inStock ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} hover:bg-green-100`}>
              {product.inStock ? 'In Stock' : 'Low Stock'}
            </Badge>
          </div>
          
          <div className="mt-8">
            <div className="flex items-center space-x-4">
              <div className="border border-gray-300 rounded-md flex items-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 px-3 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={incrementQuantity}
                  className="h-10 px-3 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className="flex-1 py-6 font-medium"
                onClick={addToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 w-full py-6 font-medium"
              onClick={() => {
                toast({
                  title: "Share Product",
                  description: "Share option coming soon!",
                });
              }}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Product
            </Button>
          </div>
          
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="text-sm">
                <p className="font-medium">Fast shipping</p>
                <p className="text-gray-500">Usually ships within 24-48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">About this product</h3>
                <p className="text-gray-700">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700">
                  <li>Printed with high-quality {product.material} material</li>
                  <li>Carefully finished and inspected for quality</li>
                  <li>Custom colors available upon request</li>
                  <li>Perfect for display, gifting, or practical use</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Material</h4>
                      <p className="text-gray-700">{product.material}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Dimensions</h4>
                      <p className="text-gray-700">Varies by design (see product details)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Weight</h4>
                      <p className="text-gray-700">Varies by design and infill percentage</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Print Quality</h4>
                      <p className="text-gray-700">0.1mm - 0.2mm layer height (fine detail)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Infill</h4>
                      <p className="text-gray-700">15-30% standard (customizable)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Finish</h4>
                      <p className="text-gray-700">Light sanding and quality check</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Customer Reviews</h3>
                  <div className="flex items-center">
                    {renderRatingStars(product.rating || '0')}
                    <span className="ml-2 text-lg font-medium">
                      {parseFloat(product.rating || '0').toFixed(1)} out of 5
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-500 mt-2">
                  Based on {product.reviewCount || 0} reviews
                </p>
                
                {product.reviewCount && product.reviewCount > 0 ? (
                  <div className="mt-6 space-y-6">
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center mb-1">
                        <div className="font-medium mr-2">Happy Customer</div>
                        <div className="text-sm text-gray-500">Verified Purchase</div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">2 months ago</span>
                      </div>
                      <p className="text-gray-700">
                        Excellent quality and fast shipping! The detail on this 3D print is amazing.
                        Will definitely order more items in the future.
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center mb-1">
                        <div className="font-medium mr-2">Craft Enthusiast</div>
                        <div className="text-sm text-gray-500">Verified Purchase</div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                        ))}
                        {[...Array(1)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500" />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">3 months ago</span>
                      </div>
                      <p className="text-gray-700">
                        Good product overall. The print quality is great but there were a few small 
                        imperfections on one side. Still, I'm quite happy with my purchase.
                      </p>
                    </div>
                    
                    <div className="text-center mt-8">
                      <Button variant="outline">
                        Load More Reviews
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet for this product.</p>
                    <Button className="mt-4">
                      Be the First to Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products Section could be added here */}
    </div>
  );
};

export default ProductDetail;
