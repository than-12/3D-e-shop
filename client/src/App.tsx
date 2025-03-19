import React from 'react';
import { Switch, Route } from "wouter";
import { Helmet } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Components
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import DebugProductsPage from "@/pages/debug-products";
import ProductCatalog from "@/pages/product-catalog";
import ApiSecurityTest from "@/pages/api-security-test";
import CalculatorPage from "@/pages/calculator";
import LithophanePage from "@/pages/lithophane";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

// Admin Components
import AdminDashboard from "@/pages/admin/index";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminEmailManagement from "@/pages/admin/email-management";
import AdminCategories from "@/pages/admin/categories";
import AdminCustomers from "@/pages/admin/customers";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminMessages from "@/pages/admin/messages";
import AdminSettings from "@/pages/admin/settings";

// Hooks
import { useAnalytics } from "@/hooks/use-analytics";

// Query Client
import { queryClient } from "@/lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/debug-products" component={DebugProductsPage} />
      <Route path="/catalog" component={ProductCatalog} />
      <Route path="/api-security-test" component={ApiSecurityTest} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/lithophane" component={LithophanePage} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      
      {/* Protected Admin routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/products">
        <AdminRoute>
          <AdminProducts />
        </AdminRoute>
      </Route>
      <Route path="/admin/orders">
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      </Route>
      <Route path="/admin/email">
        <AdminRoute>
          <AdminEmailManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/email-management">
        <AdminRoute>
          <AdminEmailManagement />
        </AdminRoute>
      </Route>
      <Route path="/admin/categories">
        <AdminRoute>
          <AdminCategories />
        </AdminRoute>
      </Route>
      <Route path="/admin/customers">
        <AdminRoute>
          <AdminCustomers />
        </AdminRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute>
          <AdminAnalytics />
        </AdminRoute>
      </Route>
      <Route path="/admin/messages">
        <AdminRoute>
          <AdminMessages />
        </AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute>
          <AdminSettings />
        </AdminRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Helmet>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="3D PrintCraft - Υπηρεσίες 3D Εκτύπωσης Υψηλής Ποιότητας" />
          <meta name="theme-color" content="#2563eb" />
          <title>3D PrintCraft | Υπηρεσίες 3D Εκτύπωσης</title>
        </Helmet>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
