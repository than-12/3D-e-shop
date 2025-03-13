import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Filter, ChevronLeft } from "lucide-react";
import { Product, Category } from "@shared/schema";
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
  CardTitle 
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Products = () => {
  const [location, setLocation] = useLocation();
  
  // Parse URL params
  const params = new URLSearchParams(location.split('?')[1]);
  const categorySlug = params.get('category');
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [sortBy, setSortBy] = useState<string>("default");
  const [materialFilters, setMaterialFilters] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products with filters
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: selectedCategory }],
  });
  
  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory) {
      setLocation(`/products?category=${selectedCategory}`);
    } else {
      setLocation('/products');
    }
  }, [selectedCategory, setLocation]);
  
  // Apply filters and sorting to products
  const filteredProducts = products?.filter((product) => {
    // Material filter
    if (materialFilters.length > 0 && !materialFilters.includes(product.material || '')) {
      return false;
    }
    
    // Availability filter
    if (availabilityFilter !== null && product.inStock !== availabilityFilter) {
      return false;
    }
    
    return true;
  }) ?? [];
  
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
  const uniqueMaterials = [...new Set(products?.map(p => p.material).filter(Boolean))];
  
  // Handle material filter changes
  const toggleMaterialFilter = (material: string) => {
    if (materialFilters.includes(material)) {
      setMaterialFilters(materialFilters.filter(m => m !== material));
    } else {
      setMaterialFilters([...materialFilters, material]);
    }
  };
  
  // Get active category name
  const activeCategoryName = categories?.find(cat => cat.slug === selectedCategory)?.name || "All Products";
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Link href="/">
              <a className="text-gray-500 hover:text-primary mr-2">
                <ChevronLeft className="h-4 w-4 inline" />
                Home
              </a>
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="font-medium">{activeCategoryName}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{activeCategoryName}</h1>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Narrow down products by these filters
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="all-categories"
                        checked={selectedCategory === null}
                        onCheckedChange={() => setSelectedCategory(null)}
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-600">
                        All Categories
                      </label>
                    </div>
                    {categories?.map(category => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategory === category.slug}
                          onCheckedChange={() => setSelectedCategory(category.slug)}
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-600">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Material</h3>
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
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="availability-all"
                        checked={availabilityFilter === null}
                        onCheckedChange={() => setAvailabilityFilter(null)}
                      />
                      <label htmlFor="availability-all" className="ml-2 text-sm text-gray-600">
                        Show All
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="availability-in-stock"
                        checked={availabilityFilter === true}
                        onCheckedChange={() => setAvailabilityFilter(true)}
                      />
                      <label htmlFor="availability-in-stock" className="ml-2 text-sm text-gray-600">
                        In Stock Only
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
                  Reset Filters
                </Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      ) : sortedProducts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="my-12">
          <CardHeader>
            <CardTitle>No products found</CardTitle>
            <CardDescription>
              Try changing your filters or browsing a different category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="mt-4">
              <Link href="/products">View All Products</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Products;
