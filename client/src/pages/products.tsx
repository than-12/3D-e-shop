import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Filter, ChevronLeft, Tag, Info } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/hooks/use-language";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

const Products = () => {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  
  // Χρησιμοποιούμε τα hooks που δημιουργήσαμε
  const { products, loading, error, pagination, fetchProducts } = useProducts();
  const { categories } = useCategories();
  
  // Parse URL params
  const params = new URLSearchParams(location.split('?')[1]);
  const categorySlug = params.get('category');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [sortBy, setSortBy] = useState<string>("default");
  const [materialFilters, setMaterialFilters] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);

  // Φορτώνουμε τα προϊόντα με τα επιλεγμένα φίλτρα
  useEffect(() => {
    // Μετατροπή του sortBy σε μορφή κατάλληλη για το API
    let sortByParam: string | undefined;
    let orderParam: 'asc' | 'desc' = 'desc';
    
    switch(sortBy) {
      case 'price-low':
        sortByParam = 'price';
        orderParam = 'asc';
        break;
      case 'price-high':
        sortByParam = 'price';
        orderParam = 'desc';
        break;
      case 'newest':
        sortByParam = 'createdAt';
        orderParam = 'desc';
        break;
      case 'name-asc':
        sortByParam = 'name';
        orderParam = 'asc';
        break;
      default:
        sortByParam = 'createdAt';
        orderParam = 'desc';
    }
    
    fetchProducts({
      category: selectedCategory || undefined,
      sortBy: sortByParam,
      order: orderParam,
      page
    });
  }, [fetchProducts, selectedCategory, sortBy, page]);
  
  // Συνδυασμένη κατάσταση φόρτωσης
  const isLoading = loading;
  
  // Εμφάνιση σφαλμάτων αν υπάρχουν
  const hasError = error;
  
  // Καταγραφή σφαλμάτων στην κονσόλα για αποσφαλμάτωση
  useEffect(() => {
    if (error) {
      console.error('Error loading products:', error);
    }
  }, [error]);
  
  // Update URL when category changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (selectedCategory) {
      newParams.set('category', selectedCategory);
    }
    
    if (materialFilters.length > 0) {
      newParams.set('materials', materialFilters.join(','));
    }
    
    if (availabilityFilter !== null) {
      newParams.set('inStock', String(availabilityFilter));
    }
    
    const queryString = newParams.toString();
    setLocation(queryString ? `/products?${queryString}` : '/products');
  }, [selectedCategory, materialFilters, availabilityFilter, setLocation]);
  
  // Apply filters and sorting to products
  const filteredProducts = products || [];
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
      case "price-high":
        return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
      case "rating":
        return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });
  
  // Get unique materials from products for filter options
  const uniqueMaterials = Array.from(
    new Set(products?.map(p => p.material).filter(Boolean) as string[])
  );
  
  // Handle material filter changes
  const toggleMaterialFilter = (material: string) => {
    if (materialFilters.includes(material)) {
      setMaterialFilters(materialFilters.filter(m => m !== material));
    } else {
      setMaterialFilters([...materialFilters, material]);
    }
  };
  
  // Get active category name
  const activeCategoryName = categories?.find(cat => cat.slug === selectedCategory)?.slug 
    ? t(`categories.${categories.find(cat => cat.slug === selectedCategory)?.slug}`)
    : t('common.all_categories');
  
  // Group categories by parent-child relationships
  const parentCategories = categories?.filter(cat => !cat.parentId) || [];
  const childCategories = categories?.filter(cat => cat.parentId) || [];
  
  // Get child categories for the currently selected parent
  const selectedParentCategory = categories?.find(cat => cat.slug === selectedCategory && !cat.parentId);
  const selectedChildCategory = categories?.find(cat => cat.slug === selectedCategory && cat.parentId);
  
  const currentParentId = selectedParentCategory?.id || selectedChildCategory?.parentId;
  const childrenOfSelected = childCategories.filter(cat => cat.parentId === currentParentId);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Banner */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{activeCategoryName}</h1>
        <p className="text-white/90 max-w-2xl">
          {selectedCategory 
            ? t('products.category_banner_description') 
            : t('products.all_products_banner_description')}
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Link href="/">
              <span className="text-gray-500 hover:text-primary mr-2 cursor-pointer">
                <ChevronLeft className="h-4 w-4 inline" />
                {t('common.home')}
              </span>
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="font-medium">{activeCategoryName}</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-1" /> 
            <span>{filteredProducts.length} {t('products.items_found')}</span>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {t('products.filter_by_category')}
                {(materialFilters.length > 0 || availabilityFilter !== null) && (
                  <Badge variant="secondary" className="ml-2">
                    {materialFilters.length + (availabilityFilter !== null ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('products.filter_by_category')}</SheetTitle>
                <SheetDescription>
                  {t('products.filter_description')}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2" /> {t('products.filter_by_category')}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="all-categories"
                        checked={selectedCategory === null}
                        onCheckedChange={() => {
                          setSelectedCategory(null);
                          // Close the sheet when a category is selected on mobile
                          if (window.innerWidth < 768) {
                            const closeButton = document.querySelector('[data-sheet-close]');
                            if (closeButton instanceof HTMLElement) {
                              closeButton.click();
                            }
                          }
                        }}
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-600 cursor-pointer w-full">
                        {t('common.all_categories')}
                      </label>
                    </div>
                    
                    {/* Parent categories */}
                    {parentCategories.map(category => (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategory === category.slug}
                            onCheckedChange={() => {
                              setSelectedCategory(category.slug);
                              // Close the sheet when a category is selected on mobile
                              if (window.innerWidth < 768) {
                                const closeButton = document.querySelector('[data-sheet-close]');
                                if (closeButton instanceof HTMLElement) {
                                  closeButton.click();
                                }
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category.id}`} 
                            className="ml-2 text-sm font-medium text-gray-800 cursor-pointer w-full"
                          >
                            {t(`categories.${category.slug}`)}
                          </label>
                        </div>
                        
                        {/* Child categories */}
                        {childCategories
                          .filter(child => child.parentId === category.id)
                          .map(childCategory => (
                            <div key={childCategory.id} className="flex items-center ml-6">
                              <Checkbox
                                id={`category-${childCategory.id}`}
                                checked={selectedCategory === childCategory.slug}
                                onCheckedChange={() => {
                                  setSelectedCategory(childCategory.slug);
                                  // Close the sheet when a category is selected on mobile
                                  if (window.innerWidth < 768) {
                                    const closeButton = document.querySelector('[data-sheet-close]');
                                    if (closeButton instanceof HTMLElement) {
                                      closeButton.click();
                                    }
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`category-${childCategory.id}`} 
                                className="ml-2 text-sm text-gray-600 cursor-pointer w-full"
                              >
                                {t(`categories.${childCategory.slug}`)}
                              </label>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{t('products.material')}</h3>
                  <div className="space-y-2">
                    {uniqueMaterials.map(material => (
                      <div key={material} className="flex items-center">
                        <Checkbox
                          id={`material-${material}`}
                          checked={materialFilters.includes(material)}
                          onCheckedChange={() => toggleMaterialFilter(material)}
                        />
                        <label htmlFor={`material-${material}`} className="ml-2 text-sm text-gray-600">
                          {material}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{t('products.availability')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="availability-all"
                        checked={availabilityFilter === null}
                        onCheckedChange={() => setAvailabilityFilter(null)}
                      />
                      <label htmlFor="availability-all" className="ml-2 text-sm text-gray-600">
                        {t('products.show_all')}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="availability-in-stock"
                        checked={availabilityFilter === true}
                        onCheckedChange={() => setAvailabilityFilter(true)}
                      />
                      <label htmlFor="availability-in-stock" className="ml-2 text-sm text-gray-600">
                        {t('products.in_stock_only')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMaterialFilters([]);
                    setAvailabilityFilter(null);
                  }}
                >
                  {t('products.reset_filters')}
                </Button>
                <SheetClose asChild>
                  <Button>{t('products.apply_filters')}</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('products.sort_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t('products.default')}</SelectItem>
              <SelectItem value="price-low">{t('products.price_low_to_high')}</SelectItem>
              <SelectItem value="price-high">{t('products.price_high_to_low')}</SelectItem>
              <SelectItem value="rating">{t('products.rating')}</SelectItem>
              <SelectItem value="newest">{t('products.newest_first')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Active Filters */}
      {(materialFilters.length > 0 || availabilityFilter !== null) && (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">{t('products.active_filters')}:</span>
          
          {materialFilters.map(material => (
            <Badge key={material} variant="secondary" className="flex items-center gap-1">
              {material}
              <button 
                onClick={() => toggleMaterialFilter(material)}
                className="ml-1 rounded-full h-4 w-4 flex items-center justify-center bg-gray-400 text-white hover:bg-gray-600"
              >
                <span className="sr-only">Remove filter</span>
                <span aria-hidden="true">&times;</span>
              </button>
            </Badge>
          ))}
          
          {availabilityFilter !== null && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('products.in_stock_only')}
              <button 
                onClick={() => setAvailabilityFilter(null)}
                className="ml-1 rounded-full h-4 w-4 flex items-center justify-center bg-gray-400 text-white hover:bg-gray-600"
              >
                <span className="sr-only">Remove filter</span>
                <span aria-hidden="true">&times;</span>
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedCategory(null);
              setMaterialFilters([]);
              setAvailabilityFilter(null);
              setSortBy("default");
            }}
            className="text-sm"
          >
            {t('products.clear_all_filters')}
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="bg-gray-300 h-64 w-full rounded-md"></div>
              <div className="mt-4 bg-gray-300 h-6 w-3/4 rounded"></div>
              <div className="mt-2 bg-gray-300 h-4 w-full rounded"></div>
              <div className="mt-4 flex justify-between">
                <div className="bg-gray-300 h-6 w-16 rounded"></div>
                <div className="bg-gray-300 h-6 w-20 rounded"></div>
              </div>
              <div className="mt-4 bg-gray-300 h-10 w-full rounded"></div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <Card className="my-12 text-center border-dashed border-2 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-500">{t('products.error_loading')}</CardTitle>
            <CardDescription>
              {t('products.error_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-gray-400">
              <Info className="h-16 w-16 mx-auto mb-4 opacity-40 text-red-400" />
              <p>{t('products.try_again')}</p>
              <details className="mt-4 text-xs text-left">
                <summary className="cursor-pointer">Λεπτομέρειες Σφάλματος</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-left">
                  {error?.toString() || ''}
                </pre>
              </details>
            </div>
          </CardContent>
          <CardFooter className="justify-center gap-4">
            <Button 
              onClick={() => {
                // Απενεργοποιούμε προσωρινά φίλτρα
                setSelectedCategory(null);
                setMaterialFilters([]);
                setAvailabilityFilter(null);
                setSortBy("default");
                // Πρέπει να προκαλέσουμε επαναφόρτωση του query, που γίνεται με την αλλαγή του URL
                window.location.href = '/products';
              }} 
              className="mt-4"
            >
              {t('products.clear_filters_and_retry')}
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="destructive" 
              className="mt-4"
            >
              {t('common.retry')}
            </Button>
          </CardFooter>
        </Card>
      ) : sortedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="my-12 text-center border-dashed border-2">
          <CardHeader>
            <CardTitle>{t('products.no_products_found')}</CardTitle>
            <CardDescription>
              {t('products.try_changing_filters')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-gray-400">
              <Filter className="h-16 w-16 mx-auto mb-4 opacity-40" />
              <p>{t('products.no_matches')}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild className="mt-4">
              <Link href="/products">{t('products.view_all_products')}</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Pagination */}
      {sortedProducts.length > 0 && (
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>
              &laquo; {t('products.previous')}
            </Button>
            <Button variant="outline" className="bg-primary text-white hover:bg-primary/90">
              1
            </Button>
            <Button variant="outline">
              2
            </Button>
            <Button variant="outline">
              3
            </Button>
            <Button variant="outline">
              {t('products.next')} &raquo;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
