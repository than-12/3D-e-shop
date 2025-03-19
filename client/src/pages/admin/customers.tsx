import { useState } from "react";
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  MoreHorizontal, 
  ArrowUpDown, 
  ChevronDown,
  UserRound,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ChevronUp,
  ShoppingBag,
  CreditCard
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Δοκιμαστικά δεδομένα πελατών
const mockCustomers = [
  {
    id: 1,
    name: "Γιώργος Παπαδόπουλος",
    email: "gpapadopoulos@example.com",
    phone: "6981234567",
    registeredAt: "2023-03-15",
    orders: 8,
    totalSpent: 342.85,
    status: "active"
  },
  {
    id: 2,
    name: "Μαρία Ιωάννου",
    email: "mioannou@example.com",
    phone: "6982345678",
    registeredAt: "2023-04-02",
    orders: 3,
    totalSpent: 125.50,
    status: "active"
  },
  {
    id: 3,
    name: "Ανδρέας Δημητρίου",
    email: "adimitriou@example.com",
    phone: "6983456789",
    registeredAt: "2023-04-10",
    orders: 1,
    totalSpent: 39.99,
    status: "active"
  },
  {
    id: 4,
    name: "Ελένη Παπαδάκη",
    email: "epapadaki@example.com",
    phone: "6984567890",
    registeredAt: "2023-05-05",
    orders: 5,
    totalSpent: 210.75,
    status: "active"
  },
  {
    id: 5,
    name: "Κώστας Αντωνίου",
    email: "kantoniou@example.com",
    phone: "6985678901",
    registeredAt: "2023-05-12",
    orders: 2,
    totalSpent: 89.98,
    status: "inactive"
  },
  {
    id: 6,
    name: "Σοφία Νικολάου",
    email: "snikolaou@example.com",
    phone: "6986789012",
    registeredAt: "2023-05-20",
    orders: 4,
    totalSpent: 157.40,
    status: "active"
  },
  {
    id: 7,
    name: "Νίκος Μαρκόπουλος",
    email: "nmarkopoulos@example.com",
    phone: "6987890123",
    registeredAt: "2023-06-01",
    orders: 0,
    totalSpent: 0,
    status: "inactive"
  },
  {
    id: 8,
    name: "Δήμητρα Λαμπροπούλου",
    email: "dlampropoulou@example.com",
    phone: "6988901234",
    registeredAt: "2023-06-10",
    orders: 6,
    totalSpent: 275.20,
    status: "active"
  }
];

// Μοκ δεδομένα αγορών για συγκεκριμένο πελάτη
const mockPurchases = [
  {
    id: '10045',
    date: '2023-10-22T14:30:00',
    amount: 78.50,
    items: 3,
    status: 'delivered'
  },
  {
    id: '10032',
    date: '2023-09-15T09:45:00',
    amount: 104.25,
    items: 5,
    status: 'delivered'
  },
  {
    id: '10018',
    date: '2023-08-03T16:20:00',
    amount: 67.90,
    items: 2,
    status: 'delivered'
  }
];

export default function AdminCustomers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Καταστάσεις για τη σελίδα
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Κατάσταση για το dialog προβολής πελάτη
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [customerPurchases, setCustomerPurchases] = useState(mockPurchases);
  
  // Φιλτράρισμα και ταξινόμηση πελατών
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === "registeredAt") {
      return sortDirection === "asc" 
        ? new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime() 
        : new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
    } else if (sortField === "orders") {
      return sortDirection === "asc" 
        ? a.orders - b.orders 
        : b.orders - a.orders;
    } else if (sortField === "totalSpent") {
      return sortDirection === "asc" 
        ? a.totalSpent - b.totalSpent 
        : b.totalSpent - a.totalSpent;
    }
    return 0;
  });

  // Άνοιγμα dialog για προβολή πελάτη
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerPurchases(mockPurchases);
    setIsViewDialogOpen(true);
  };

  // Αλλαγή κατάστασης πελάτη (active/inactive)
  const handleToggleStatus = (customer: any) => {
    const newStatus = customer.status === "active" ? "inactive" : "active";
    setCustomers(customers.map(c => 
      c.id === customer.id ? { ...c, status: newStatus } : c
    ));
    
    toast({
      title: "Κατάσταση πελάτη ενημερώθηκε",
      description: `Ο πελάτης είναι τώρα ${newStatus === "active" ? "ενεργός" : "ανενεργός"}.`,
    });
  };

  // Αλλαγή ταξινόμησης
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Μορφοποίηση ποσού σε ευρώ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Μορφοποίηση ημερομηνίας
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('el-GR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <AdminLayout title={t('admin.customers')} description="Διαχείριση πελατών και λογαριασμών χρηστών">
      {/* Φίλτρα και αναζήτηση */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Αναζήτηση πελατών..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Κατάσταση" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι πελάτες</SelectItem>
              <SelectItem value="active">Ενεργοί πελάτες</SelectItem>
              <SelectItem value="inactive">Ανενεργοί πελάτες</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Πίνακας πελατών */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Όνομα
                  {sortField === "name" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "name" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Τηλέφωνο</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("registeredAt")}>
                <div className="flex items-center">
                  Εγγραφή
                  {sortField === "registeredAt" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "registeredAt" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("orders")}>
                <div className="flex items-center">
                  Παραγγελίες
                  {sortField === "orders" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "orders" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("totalSpent")}>
                <div className="flex items-center">
                  Συνολικές Αγορές
                  {sortField === "totalSpent" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "totalSpent" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Κατάσταση</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{formatDate(customer.registeredAt)}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell>
                    {customer.status === "active" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ενεργός</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ανενεργός</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ενέργειες</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                          Προβολή Λεπτομερειών
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(customer)}>
                          {customer.status === "active" ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Δεν βρέθηκαν πελάτες με τα επιλεγμένα κριτήρια.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog προβολής λεπτομερειών πελάτη */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Στοιχεία Πελάτη</DialogTitle>
            <DialogDescription>
              Λεπτομερή στοιχεία και ιστορικό του πελάτη.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="py-4">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                  <Badge className={`mt-1 ${
                    selectedCustomer.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedCustomer.status === "active" ? "Ενεργός" : "Ανενεργός"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Τηλέφωνο</p>
                      <p>{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                      <p>{formatDate(selectedCustomer.registeredAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Σύνοψη Αγορών</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Συνολικές Παραγγελίες</p>
                      <p className="text-xl font-semibold">{selectedCustomer.orders}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Συνολικές Αγορές</p>
                      <p className="text-xl font-semibold">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Κλείσιμο</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 