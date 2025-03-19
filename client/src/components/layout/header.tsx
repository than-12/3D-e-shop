import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Box, 
  ShoppingCart, 
  User, 
  Menu, 
  ChevronDown,
  LogIn,
  LogOut,
  UserCircle,
  ShoppingBag,
  X
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useUserStore } from "@/lib/userStore";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, user } = useUserStore();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: cartItems } = useQuery<any[]>({
    queryKey: ['/api/cart'],
  });
  
  // Υπολογισμός συνολικής ποσότητας προϊόντων στο καλάθι
  const cartItemCount = cartItems && Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + (item.quantity || 1), 0) 
    : 0;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Εναλλαγή κλάσης κατά το scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <span className="flex items-center text-xl font-bold text-primary">
              3D PrintCraft
            </span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t("common.home")}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t("common.products")}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <Link href="/products">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("common.all_categories")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.browse_all")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/products?category=figurines">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("categories.figurines", "Φιγούρες")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.browse_figurines", "Περιηγηθείτε στις φιγούρες")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/products?category=household">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("categories.household", "Οικιακά είδη")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.browse_household", "Περιηγηθείτε στα οικιακά είδη")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/products?category=gadgets">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("categories.gadgets", "Gadgets")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.browse_gadgets", "Περιηγηθείτε στα gadgets")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>{t("common.services", "Υπηρεσίες")}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <Link href="/calculator">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("common.calculator")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.calculator_desc", "Υπολογίστε το κόστος του μοντέλου σας")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                    <Link href="/lithophane">
                      <NavigationMenuLink
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          {t("common.lithophane")}
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          {t("nav.lithophane_desc", "Μετατρέψτε φωτογραφίες σε 3D αντικείμενα")}
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/about">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t("common.about")}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t("common.contact")}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Toggle Menu"
              className="text-gray-600" 
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <div className="flex items-center ml-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <UserCircle className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("common.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>{t("common.orders")}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Box className="mr-2 h-4 w-4" />
                        <span>{t("admin.panel")}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => useUserStore.getState().logout()}
                    className="flex items-center text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span>{t("common.login")}</span>
                </Link>
              </Button>
            )}
          </div>
          
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <nav className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="font-bold text-lg text-primary">3D PrintCraft</div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <Link 
              href="/" 
              className={`block py-2 text-base font-medium border-l-4 transition-colors ${location === '/' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary hover:border-primary/30'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="pl-3">{t('common.home')}</div>
            </Link>
            
            <div>
              <div className="block py-2 text-base font-medium pl-3 text-gray-600">
                {t('common.products')}
              </div>
              <div className="space-y-2 mt-2 pl-6">
                <Link 
                  href="/products" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('common.all_categories')}
                </Link>
                <Link 
                  href="/products?category=figurines" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('categories.figurines', 'Φιγούρες')}
                </Link>
                <Link 
                  href="/products?category=household" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('categories.household', 'Οικιακά είδη')}
                </Link>
                <Link 
                  href="/products?category=gadgets" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('categories.gadgets', 'Gadgets')}
                </Link>
              </div>
            </div>
            
            <div>
              <div className="block py-2 text-base font-medium pl-3 text-gray-600">
                {t('common.services', 'Υπηρεσίες')}
              </div>
              <div className="space-y-2 mt-2 pl-6">
                <Link 
                  href="/calculator" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('common.calculator')}
                </Link>
                <Link 
                  href="/lithophane" 
                  className="block py-1.5 text-sm text-gray-600 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('common.lithophane')}
                </Link>
              </div>
            </div>
            
            <Link 
              href="/about" 
              className={`block py-2 text-base font-medium border-l-4 transition-colors ${location === '/about' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary hover:border-primary/30'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="pl-3">{t('common.about')}</div>
            </Link>
            
            <Link 
              href="/contact" 
              className={`block py-2 text-base font-medium border-l-4 transition-colors ${location === '/contact' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary hover:border-primary/30'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="pl-3">{t('common.contact')}</div>
            </Link>
            
            {!isAuthenticated && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <Button variant="default" className="w-full mb-2" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    {t('common.login')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    {t('common.register')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
