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
import { useLanguage } from "@/hooks/use-language";
import { formatPrice } from "@/lib/utils";

const ProductDetail = () => {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });
  
  // Redirect to products page if product not found
  useEffect(() => {
    if (error) {
      toast({
        title: t('products.product_not_found'),
        description: t('products.product_not_found_description'),
        variant: "destructive",
      });
      setLocation("/products");
    }
  }, [error, setLocation, toast, t]);
  
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
        title: t('products.added_to_cart'),
        description: `${quantity} x ${product.name} ${t('products.has_been_added_to_cart')}`,
      });
      
      // Reset quantity
      setQuantity(1);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('products.failed_to_add_to_cart'),
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
          {t('products.back_to_products')}
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
                        <Badge className="bg-primary hover:bg-primary">{t('products.featured')}</Badge>
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
                          alt={`${product.name} - ${t('products.view')} ${idx + 2}`} 
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
                    alt={`${t('products.thumbnail')} ${idx + 1}`} 
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
              {product.reviewCount || 0} {t('products.reviews')}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(Number(product.price), { locale: currentLanguage === 'el' ? 'el-GR' : 'en-GB' })}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t('products.includes_shipping')}
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
              {product.inStock ? t('products.in_stock') : t('products.low_stock')}
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
                {t('common.add_to_cart')}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 w-full py-6 font-medium"
              onClick={() => {
                toast({
                  title: t('products.share_product'),
                  description: t('products.share_coming_soon'),
                });
              }}
            >
              <Share2 className="h-5 w-5 mr-2" />
              {t('products.share_product')}
            </Button>
          </div>
          
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="text-sm">
                <p className="font-medium">{t('products.fast_shipping')}</p>
                <p className="text-gray-500">{t('products.ships_within')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">{t('products.product_details')}</TabsTrigger>
            <TabsTrigger value="specifications">{t('products.specifications')}</TabsTrigger>
            <TabsTrigger value="reviews">{t('products.reviews')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">{t('products.about_this_product')}</h3>
                <p className="text-gray-700">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700">
                  <li>{t('products.printed_with')} {product.material} {t('products.material_suffix')}</li>
                  <li>{t('products.carefully_finished')}</li>
                  <li>{t('products.custom_colors')}</li>
                  <li>{t('products.perfect_for')}</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">{t('products.product_specifications')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.material')}</h4>
                      <p className="text-gray-700">{product.material}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.dimensions')}</h4>
                      <p className="text-gray-700">{t('products.varies_by_design')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.weight')}</h4>
                      <p className="text-gray-700">{t('products.varies_by_design_and_infill')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.print_quality')}</h4>
                      <p className="text-gray-700">{t('products.layer_height')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.infill')}</h4>
                      <p className="text-gray-700">{t('products.infill_percentage')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('products.finish')}</h4>
                      <p className="text-gray-700">{t('products.finish_description')}</p>
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
                  <h3 className="text-lg font-medium">{t('products.customer_reviews')}</h3>
                  <div className="flex items-center">
                    {renderRatingStars(product.rating || '0')}
                    <span className="ml-2 text-lg font-medium">
                      {parseFloat(product.rating || '0').toFixed(1)} {t('products.out_of_5')}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-500 mt-2">
                  {t('products.based_on')} {product.reviewCount || 0} {t('products.reviews')}
                </p>
                
                {product.reviewCount && product.reviewCount > 0 ? (
                  <div className="mt-6 space-y-6">
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center mb-1">
                        <div className="font-medium mr-2">{t('products.happy_customer')}</div>
                        <div className="text-sm text-gray-500">{t('products.verified_purchase')}</div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">{t('products.months_ago', { count: 2 })}</span>
                      </div>
                      <p className="text-gray-700">
                        {t('products.review_text_1')}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center mb-1">
                        <div className="font-medium mr-2">{t('products.craft_enthusiast')}</div>
                        <div className="text-sm text-gray-500">{t('products.verified_purchase')}</div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                        ))}
                        {[...Array(1)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-amber-500" />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">{t('products.months_ago', { count: 3 })}</span>
                      </div>
                      <p className="text-gray-700">
                        {t('products.review_text_2')}
                      </p>
                    </div>
                    
                    <div className="text-center mt-8">
                      <Button variant="outline">
                        {t('products.load_more_reviews')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">{t('products.no_reviews_yet')}</p>
                    <Button className="mt-4">
                      {t('products.be_first_to_review')}
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
