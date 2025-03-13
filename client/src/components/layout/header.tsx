import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  ChevronDown 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Category } from "@shared/schema";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
  });
  
  const cartItemCount = cartItems?.length || 0;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Box className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold">3D PrintCraft</span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/">
                <a className={`text-gray-900 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
                  Home
                </a>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-900 hover:text-primary font-medium inline-flex items-center">
                    Products
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/products">
                      <a className="w-full">All Products</a>
                    </Link>
                  </DropdownMenuItem>
                  {categories?.map(category => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link href={`/products?category=${category.slug}`}>
                        <a className="w-full">{category.name}</a>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link href="/calculator">
                <a className={`text-gray-900 hover:text-primary font-medium ${location === '/calculator' ? 'text-primary' : ''}`}>
                  Cost Calculator
                </a>
              </Link>
              
              <Link href="/lithophane">
                <a className={`text-gray-900 hover:text-primary font-medium ${location === '/lithophane' ? 'text-primary' : ''}`}>
                  Lithophanes
                </a>
              </Link>
              
              <Link href="/about">
                <a className={`text-gray-900 hover:text-primary font-medium ${location === '/about' ? 'text-primary' : ''}`}>
                  About Us
                </a>
              </Link>
              
              <Link href="/contact">
                <a className={`text-gray-900 hover:text-primary font-medium ${location === '/contact' ? 'text-primary' : ''}`}>
                  Contact
                </a>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 text-gray-700 hover:text-primary">
              <Search className="h-5 w-5" />
            </button>
            
            <Link href="/cart">
              <a className="ml-4 p-2 text-gray-700 hover:text-primary relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </a>
            </Link>
            
            <button className="ml-4 p-2 text-gray-700 hover:text-primary hidden md:block">
              <User className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className="ml-4 md:hidden p-2 text-gray-700 hover:text-primary"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? '' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              Home
            </a>
          </Link>
          <Link href="/products">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/products' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              Products
            </a>
          </Link>
          <Link href="/calculator">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/calculator' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              Cost Calculator
            </a>
          </Link>
          <Link href="/lithophane">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/lithophane' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              Lithophanes
            </a>
          </Link>
          <Link href="/about">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/about' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              About Us
            </a>
          </Link>
          <Link href="/contact">
            <a className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 border-l-4 ${location === '/contact' ? 'border-primary' : 'border-transparent hover:bg-gray-50'}`}>
              Contact
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
