import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  BarChart, 
  FileText, 
  Grid, 
  Inbox, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useUserStore } from "@/lib/userStore";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SEO } from "@/components/ui/seo";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUserStore();
  
  // Έλεγχος εάν ο χρήστης είναι διαχειριστής
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = '/login?redirect=/admin';
    }
  }, [user]);

  const menuItems = [
    {
      title: t('admin.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin',
    },
    {
      title: t('admin.orders'),
      icon: <ShoppingCart className="w-5 h-5" />,
      href: '/admin/orders',
    },
    {
      title: t('admin.products'),
      icon: <Package className="w-5 h-5" />,
      href: '/admin/products',
    },
    {
      title: t('admin.categories'),
      icon: <Grid className="w-5 h-5" />,
      href: '/admin/categories',
    },
    {
      title: t('admin.customers'),
      icon: <Users className="w-5 h-5" />,
      href: '/admin/customers',
    },
    {
      title: t('admin.analytics'),
      icon: <BarChart className="w-5 h-5" />,
      href: '/admin/analytics',
    },
    {
      title: t('admin.messages'),
      icon: <Inbox className="w-5 h-5" />,
      href: '/admin/messages',
      badge: 2,
    },
    {
      title: t('admin.email'),
      icon: <FileText className="w-5 h-5" />,
      href: '/admin/email-management',
    },
    {
      title: t('admin.settings'),
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings',
    },
  ];

  if (!user) {
    return <div className="p-8 text-center">Φόρτωση...</div>;
  }

  return (
    <>
      <SEO 
        title={`${title} - ${t('admin.panel')}`} 
        description={description || t('admin.meta_description')} 
      />
      
      <div className="flex min-h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-primary">3D PrintCraft</h1>
            <p className="text-sm text-gray-500">{t('admin.panel')}</p>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a 
                      className={`flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                        location === item.href ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                {user.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto text-gray-500 hover:text-red-500"
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-white shadow-sm p-4 flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-500 p-2 rounded-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="ml-4 text-lg font-semibold text-gray-900">{title}</h1>
          
          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              {user.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[80%] max-w-xs">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-left">3D PrintCraft</SheetTitle>
              <SheetDescription className="text-left">{t('admin.panel')}</SheetDescription>
            </SheetHeader>
            
            <nav className="p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a 
                        className={`flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                          location === item.href ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-1">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t mt-auto">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                  {user.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto text-gray-500 hover:text-red-500"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Main content */}
        <main className="flex-1 md:ml-64 pt-4 md:pt-0">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <div className="hidden md:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && <p className="text-gray-500 mt-1">{description}</p>}
              </div>
              
              <Button 
                variant="outline" 
                className="text-gray-500"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('common.logout')}
              </Button>
            </div>
            
            <div className="mt-16 md:mt-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 