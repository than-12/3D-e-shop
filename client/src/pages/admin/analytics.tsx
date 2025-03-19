import { useState } from "react";
import { 
  LineChart, 
  BarChart, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ArrowUp, 
  ArrowDown,
  ArrowRight,
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag,
  CircleUser
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Package } from "lucide-react";

// Τα δεδομένα αυτά θα τα παίρνουμε από το API σε πραγματική εφαρμογή
const mockRevenueData = [
  { month: "Ιαν", amount: 1200 },
  { month: "Φεβ", amount: 1800 },
  { month: "Μαρ", amount: 2400 },
  { month: "Απρ", amount: 2100 },
  { month: "Μάι", amount: 2800 },
  { month: "Ιουν", amount: 3200 },
  { month: "Ιουλ", amount: 3100 },
  { month: "Αυγ", amount: 3400 },
  { month: "Σεπ", amount: 3600 },
  { month: "Οκτ", amount: 4000 },
  { month: "Νοε", amount: 3800 },
  { month: "Δεκ", amount: 4200 },
];

const mockOrdersData = [
  { month: "Ιαν", count: 42 },
  { month: "Φεβ", count: 63 },
  { month: "Μαρ", count: 75 },
  { month: "Απρ", count: 68 },
  { month: "Μάι", count: 82 },
  { month: "Ιουν", count: 94 },
  { month: "Ιουλ", count: 90 },
  { month: "Αυγ", count: 105 },
  { month: "Σεπ", count: 110 },
  { month: "Οκτ", count: 125 },
  { month: "Νοε", count: 115 },
  { month: "Δεκ", count: 135 },
];

const mockTopProducts = [
  { name: "Φιγούρα Darth Vader", sold: 48, revenue: 1919.52 },
  { name: "Μινιατούρα Πύργος του Άιφελ", sold: 36, revenue: 719.64 },
  { name: "Βάση για κινητό τηλέφωνο", sold: 32, revenue: 479.68 },
  { name: "Σετ Κοσμημάτων", sold: 24, revenue: 1199.76 },
  { name: "Κουτί Αποθήκευσης με LED", sold: 20, revenue: 499.80 },
];

const mockVisitorsData = {
  thisWeek: 1245,
  lastWeek: 1120,
  percentChange: 11.16
};

const mockConversionRate = {
  current: 3.8,
  previous: 3.2,
  percentChange: 18.75
};

const mockAverageOrderValue = {
  current: 32.50,
  previous: 28.75,
  percentChange: 13.04
};

const mockMetrics = {
  totalRevenue: 34520,
  totalOrders: 1100,
  totalCustomers: 845,
};

const revenueData = [
  { month: 'Ιαν', amount: 4200 },
  { month: 'Φεβ', amount: 3800 },
  { month: 'Μαρ', amount: 5100 },
  { month: 'Απρ', amount: 4700 },
  { month: 'Μάι', amount: 5800 },
  { month: 'Ιουν', amount: 6300 },
  { month: 'Ιουλ', amount: 5900 },
  { month: 'Αυγ', amount: 6700 },
  { month: 'Σεπ', amount: 7200 },
  { month: 'Οκτ', amount: 8100 },
  { month: 'Νοε', amount: 7800 },
  { month: 'Δεκ', amount: 9500 }
];

const ordersData = [
  { month: 'Ιαν', count: 42 },
  { month: 'Φεβ', count: 38 },
  { month: 'Μαρ', count: 51 },
  { month: 'Απρ', count: 47 },
  { month: 'Μάι', count: 58 },
  { month: 'Ιουν', count: 63 },
  { month: 'Ιουλ', count: 59 },
  { month: 'Αυγ', count: 67 },
  { month: 'Σεπ', count: 72 },
  { month: 'Οκτ', count: 81 },
  { month: 'Νοε', count: 78 },
  { month: 'Δεκ', count: 95 }
];

const topProducts = [
  { id: 1, name: 'Φιγούρα 3D Batman', sales: 78, revenue: 1950 },
  { id: 2, name: 'Βάση Κινητού', sales: 65, revenue: 975 },
  { id: 3, name: 'Διακοσμητικό Βάζο', sales: 54, revenue: 1620 },
  { id: 4, name: 'Μηχανικό Εξάρτημα XYZ', sales: 42, revenue: 1260 },
  { id: 5, name: 'Μινιατούρα Πύργος Άιφελ', sales: 38, revenue: 950 }
];

const visitorsData = {
  total: 24580,
  change: 15.3,
  period: 'από τον προηγούμενο μήνα'
};

const conversionRateData = {
  rate: 3.6,
  change: 0.8,
  period: 'από τον προηγούμενο μήνα'
};

const averageOrderData = {
  value: 75.2,
  change: 5.4,
  period: 'από τον προηγούμενο μήνα'
};

const overallMetrics = {
  revenue: {
    total: 75640,
    change: 12.5
  },
  orders: {
    total: 751,
    change: 8.3
  },
  customers: {
    total: 420,
    change: 14.7
  }
};

// Προσομοίωση γραφήματος πωλήσεων με CSS
const RevenueChart = () => {
  const maxAmount = Math.max(...revenueData.map(item => item.amount));
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end h-64 mt-4">
        {revenueData.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div className="flex-grow w-full flex items-end justify-center">
              <div 
                className="bg-primary/90 rounded-t-md w-4/5"
                style={{ height: `${(item.amount / maxAmount) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Προσομοίωση γραφήματος παραγγελιών με CSS
const OrdersChart = () => {
  const maxCount = Math.max(...ordersData.map(item => item.count));
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end h-64 mt-4">
        {ordersData.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div className="flex-grow w-full flex items-end justify-center">
              <div 
                className="bg-blue-500/80 rounded-t-md w-4/5"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('year');
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <AdminLayout title={t('admin.analytics')} description="Αναλυτικά στατιστικά και δεδομένα πωλήσεων">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Πίνακας Στατιστικών</h2>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Χρονικό διάστημα" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Σήμερα</SelectItem>
              <SelectItem value="week">Αυτή την εβδομάδα</SelectItem>
              <SelectItem value="month">Αυτόν τον μήνα</SelectItem>
              <SelectItem value="year">Φέτος</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Προσαρμογή διαστήματος
          </Button>
        </div>
      </div>

      {/* Κάρτες Συνοπτικών Μετρικών */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallMetrics.revenue.total)}</div>
            <div className="flex items-center pt-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{overallMetrics.revenue.change}% από τον προηγούμενο χρόνο</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.orders.total}</div>
            <div className="flex items-center pt-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{overallMetrics.orders.change}% από τον προηγούμενο χρόνο</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Συνολικοί Πελάτες</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.customers.total}</div>
            <div className="flex items-center pt-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+{overallMetrics.customers.change}% από τον προηγούμενο χρόνο</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Γραφήματα Πωλήσεων */}
      <Tabs defaultValue="revenue" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="revenue">Έσοδα</TabsTrigger>
            <TabsTrigger value="orders">Παραγγελίες</TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm">
            <span className="mr-2">Λήψη αναφοράς</span>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Έσοδα {timeRange === "year" ? "2023" : ""}</CardTitle>
              <CardDescription>
                Συνολικά έσοδα: {formatCurrency(revenueData.reduce((sum, item) => sum + item.amount, 0))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Παραγγελίες {timeRange === "year" ? "2023" : ""}</CardTitle>
              <CardDescription>
                Συνολικές παραγγελίες: {ordersData.reduce((sum, item) => sum + item.count, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Επισκέπτες */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Επισκέπτες</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVisitorsData.thisWeek}</div>
            <div className={`flex items-center pt-1 text-sm ${mockVisitorsData.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mockVisitorsData.percentChange >= 0 ? 
                <ArrowUp className="h-4 w-4 mr-1" /> : 
                <ArrowDown className="h-4 w-4 mr-1" />
              }
              <span>{mockVisitorsData.percentChange.toFixed(2)}% από την προηγούμενη εβδομάδα</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Ποσοστό Μετατροπής */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ποσοστό Μετατροπής</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockConversionRate.current}%</div>
            <div className={`flex items-center pt-1 text-sm ${mockConversionRate.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mockConversionRate.percentChange >= 0 ? 
                <ArrowUp className="h-4 w-4 mr-1" /> : 
                <ArrowDown className="h-4 w-4 mr-1" />
              }
              <span>{mockConversionRate.percentChange.toFixed(2)}% από την προηγούμενη περίοδο</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Μέσος Όρος Παραγγελίας */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Μέσος Όρος Παραγγελίας</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockAverageOrderValue.current)}</div>
            <div className={`flex items-center pt-1 text-sm ${mockAverageOrderValue.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mockAverageOrderValue.percentChange >= 0 ? 
                <ArrowUp className="h-4 w-4 mr-1" /> : 
                <ArrowDown className="h-4 w-4 mr-1" />
              }
              <span>{mockAverageOrderValue.percentChange.toFixed(2)}% από την προηγούμενη περίοδο</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Κορυφαία Προϊόντα */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Κορυφαία Προϊόντα</CardTitle>
          <CardDescription>Τα πιο δημοφιλή προϊόντα βάσει πωλήσεων</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-4 w-6 text-center">{index + 1}.</div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.sold} πωλήσεις</div>
                  </div>
                </div>
                <div className="text-right font-medium">{formatCurrency(product.revenue)}</div>
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-4 flex items-center justify-center">
              <span className="mr-2">Δείτε όλα τα προϊόντα</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAnalytics; 