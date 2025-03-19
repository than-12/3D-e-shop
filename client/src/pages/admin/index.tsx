import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowRight, Users, Package, ShoppingCart, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import AdminLayout from "@/components/admin/admin-layout";

// Σύνθεση δοκιμαστικών δεδομένων - αυτά θα έρχονται από το API
const mockData = {
  revenue: {
    total: 28950,
    change: 12.5,
    trend: "up" as const,
  },
  orders: {
    total: 348,
    change: 8.2,
    trend: "up" as const,
    pending: 24,
    processing: 12,
    completed: 312,
  },
  customers: {
    total: 573,
    change: 5.3,
    trend: "up" as const,
    new: 48,
  },
  products: {
    total: 157,
    outOfStock: 8,
    lowStock: 15,
  },
  recentOrders: [
    { id: "ORD-7843", customer: "Γιώργος Παπαδόπουλος", total: 126.50, status: "completed", date: "2023-06-08" },
    { id: "ORD-7842", customer: "Μαρία Αντωνίου", total: 89.99, status: "processing", date: "2023-06-08" },
    { id: "ORD-7841", customer: "Ιωάννης Δημητρίου", total: 235.00, status: "pending", date: "2023-06-07" },
    { id: "ORD-7840", customer: "Ελένη Παπαδοπούλου", total: 49.99, status: "completed", date: "2023-06-07" },
    { id: "ORD-7839", customer: "Δημήτρης Νικολάου", total: 187.50, status: "completed", date: "2023-06-06" },
  ],
  topProducts: [
    { id: 1, name: "Φιγούρα Darth Vader", sales: 56, revenue: 2240 },
    { id: 2, name: "Κουτί αποθήκευσης RGB", sales: 43, revenue: 1720 },
    { id: 3, name: "Βάση smartphone", sales: 38, revenue: 950 },
    { id: 4, name: "Σετ μηχανικά γρανάζια", sales: 32, revenue: 1280 },
  ],
};

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState(mockData);
  
  // Σε πραγματικές συνθήκες θα χρησιμοποιούσαμε το API
  /*
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['admin/dashboard/stats'],
  });
  
  useEffect(() => {
    if (dashboardStats) {
      setStatsData(dashboardStats);
    }
  }, [dashboardStats]);
  */
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "processing": return "text-blue-600 bg-blue-100";
      case "pending": return "text-amber-600 bg-amber-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('el-GR').format(date);
  };
  
  return (
    <AdminLayout title={t('admin.dashboard')} description={t('admin.dashboard_description')}>
      {/* Κύριες μετρήσεις */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('admin.revenue')}
            </CardTitle>
            <PieChart className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(statsData.revenue.total)}</div>
            <div className="flex items-center pt-1">
              {statsData.revenue.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={statsData.revenue.trend === "up" ? "text-green-500" : "text-red-500"}>
                {statsData.revenue.change}%
              </span>
              <span className="text-gray-500 text-xs ml-1">από τον προηγούμενο μήνα</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('admin.orders')}
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.orders.total}</div>
            <div className="flex items-center pt-1">
              {statsData.orders.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={statsData.orders.trend === "up" ? "text-green-500" : "text-red-500"}>
                {statsData.orders.change}%
              </span>
              <span className="text-gray-500 text-xs ml-1">από τον προηγούμενο μήνα</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('admin.customers')}
            </CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.customers.total}</div>
            <div className="flex items-center pt-1">
              {statsData.customers.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={statsData.customers.trend === "up" ? "text-green-500" : "text-red-500"}>
                {statsData.customers.change}%
              </span>
              <span className="text-gray-500 text-xs ml-1">από τον προηγούμενο μήνα</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('admin.products')}
            </CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.products.total}</div>
            <div className="flex items-center pt-1 text-gray-500 text-xs gap-x-2">
              <span className="text-amber-600">{statsData.products.lowStock} χαμηλό στοκ</span>
              <span>•</span>
              <span className="text-red-600">{statsData.products.outOfStock} εκτός στοκ</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Γραφικά και πρόσφατες παραγγελίες */}
      <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-12 mt-6">
        {/* Κατάσταση παραγγελιών και κορυφαία προϊόντα */}
        <div className="md:col-span-3 lg:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t('admin.order_status')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Ολοκληρωμένες</span>
                    <span className="font-medium">{statsData.orders.completed}</span>
                  </div>
                  <Progress value={(statsData.orders.completed / statsData.orders.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Σε επεξεργασία</span>
                    <span className="font-medium">{statsData.orders.processing}</span>
                  </div>
                  <Progress value={(statsData.orders.processing / statsData.orders.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Αναμονή</span>
                    <span className="font-medium">{statsData.orders.pending}</span>
                  </div>
                  <Progress value={(statsData.orders.pending / statsData.orders.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-amber-500" />
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">{t('admin.top_products')}</h3>
                <div className="space-y-4">
                  {statsData.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500">{product.sales} πωλήσεις</span>
                      </div>
                      <span className="font-medium">{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Πρόσφατες παραγγελίες */}
        <div className="md:col-span-3 lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.recent_orders')}</CardTitle>
                <CardDescription>{t('admin.recent_orders_description')}</CardDescription>
              </div>
              <Button variant="outline" asChild className="h-8">
                <Link href="/admin/orders">
                  <span className="text-xs">{t('admin.view_all')}</span>
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b text-sm text-gray-500">
                      <th className="pb-2 font-medium">{t('admin.order_id')}</th>
                      <th className="pb-2 font-medium">{t('admin.customer')}</th>
                      <th className="pb-2 font-medium">{t('admin.status')}</th>
                      <th className="pb-2 font-medium">{t('admin.date')}</th>
                      <th className="pb-2 font-medium text-right">{t('admin.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {statsData.recentOrders.map((order) => (
                      <tr key={order.id} className="text-sm">
                        <td className="py-3 font-medium">{order.id}</td>
                        <td className="py-3">{order.customer}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status === "completed" && "Ολοκληρώθηκε"}
                            {order.status === "processing" && "Σε επεξεργασία"}
                            {order.status === "pending" && "Αναμονή"}
                            {order.status === "cancelled" && "Ακυρώθηκε"}
                          </span>
                        </td>
                        <td className="py-3">{formatDate(order.date)}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 