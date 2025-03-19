import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Eye, 
  FileDown, 
  Printer,
  ArrowUpDown,
  Calendar,
  X
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

// Σύνθεση δοκιμαστικών δεδομένων - αυτά θα έρχονται από το API
const mockOrders = [
  {
    id: "ORD-7843",
    customer: {
      name: "Γιώργος Παπαδόπουλος",
      email: "gpapadopoulos@example.com",
      phone: "6900000001"
    },
    status: "completed",
    paymentStatus: "paid",
    date: "2023-06-08",
    total: 126.50,
    items: [
      { id: 1, name: "Φιγούρα Darth Vader", price: 39.99, quantity: 2, total: 79.98 },
      { id: 3, name: "Κουτί Αποθήκευσης με LED", price: 24.99, quantity: 1, total: 24.99 }
    ],
    shipping: {
      method: "Κούριερ",
      cost: 5.99,
      address: {
        street: "Λεωφόρος Αλεξάνδρας 15",
        city: "Αθήνα",
        postalCode: "11521",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "Κάρτα",
      cardLast4: "4242"
    }
  },
  {
    id: "ORD-7842",
    customer: {
      name: "Μαρία Αντωνίου",
      email: "mantoniou@example.com",
      phone: "6900000002"
    },
    status: "processing",
    paymentStatus: "paid",
    date: "2023-06-08",
    total: 89.99,
    items: [
      { id: 5, name: "Μινιατούρα Πύργος του Άιφελ", price: 19.99, quantity: 1, total: 19.99 },
      { id: 2, name: "Βάση για κινητό τηλέφωνο", price: 14.99, quantity: 2, total: 29.98 }
    ],
    shipping: {
      method: "Κούριερ",
      cost: 5.99,
      address: {
        street: "Ιπποκράτους 25",
        city: "Αθήνα",
        postalCode: "11521",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "PayPal"
    }
  },
  {
    id: "ORD-7841",
    customer: {
      name: "Ιωάννης Δημητρίου",
      email: "idimitriou@example.com",
      phone: "6900000003"
    },
    status: "pending",
    paymentStatus: "pending",
    date: "2023-06-07",
    total: 235.00,
    items: [
      { id: 4, name: "Σετ Μηχανικά Γρανάζια", price: 29.99, quantity: 5, total: 149.95 },
      { id: 7, name: "Σετ Κοσμημάτων", price: 49.99, quantity: 1, total: 49.99 }
    ],
    shipping: {
      method: "Παραλαβή από κατάστημα",
      cost: 0,
      address: {
        street: "",
        city: "",
        postalCode: "",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "Αντικαταβολή"
    }
  },
  {
    id: "ORD-7840",
    customer: {
      name: "Ελένη Παπαδοπούλου",
      email: "epapadopoulou@example.com",
      phone: "6900000004"
    },
    status: "completed",
    paymentStatus: "paid",
    date: "2023-06-07",
    total: 49.99,
    items: [
      { id: 7, name: "Σετ Κοσμημάτων", price: 49.99, quantity: 1, total: 49.99 }
    ],
    shipping: {
      method: "Κούριερ",
      cost: 5.99,
      address: {
        street: "Ερμού 10",
        city: "Θεσσαλονίκη",
        postalCode: "54624",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "Κάρτα",
      cardLast4: "1234"
    }
  },
  {
    id: "ORD-7839",
    customer: {
      name: "Δημήτρης Νικολάου",
      email: "dnikolaou@example.com",
      phone: "6900000005"
    },
    status: "completed",
    paymentStatus: "paid",
    date: "2023-06-06",
    total: 187.50,
    items: [
      { id: 1, name: "Φιγούρα Darth Vader", price: 39.99, quantity: 1, total: 39.99 },
      { id: 3, name: "Κουτί Αποθήκευσης με LED", price: 24.99, quantity: 2, total: 49.98 },
      { id: 4, name: "Σετ Μηχανικά Γρανάζια", price: 29.99, quantity: 3, total: 89.97 }
    ],
    shipping: {
      method: "Κούριερ",
      cost: 5.99,
      address: {
        street: "Αριστοτέλους 15",
        city: "Πάτρα",
        postalCode: "26221",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "Κάρτα",
      cardLast4: "5678"
    }
  },
  {
    id: "ORD-7838",
    customer: {
      name: "Αναστασία Κοντού",
      email: "akontou@example.com",
      phone: "6900000006"
    },
    status: "cancelled",
    paymentStatus: "refunded",
    date: "2023-06-05",
    total: 65.97,
    items: [
      { id: 6, name: "Διακοσμητικά Λουλούδια", price: 9.99, quantity: 3, total: 29.97 },
      { id: 2, name: "Βάση για κινητό τηλέφωνο", price: 14.99, quantity: 2, total: 29.98 }
    ],
    shipping: {
      method: "Κούριερ",
      cost: 5.99,
      address: {
        street: "Κύπρου 8",
        city: "Ηράκλειο",
        postalCode: "71201",
        country: "Ελλάδα"
      }
    },
    payment: {
      method: "PayPal"
    }
  }
];

export default function AdminOrders() {
  const { t } = useLanguage();
  
  // Καταστάσεις για τη σελίδα
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Όλες");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("Όλες");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Καταστάσεις για dialogs
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  // Φίλτραρε και ταξινόμησε τις παραγγελίες
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "Όλες" || 
                         (statusFilter === "Ολοκληρωμένες" && order.status === "completed") ||
                         (statusFilter === "Σε επεξεργασία" && order.status === "processing") ||
                         (statusFilter === "Σε αναμονή" && order.status === "pending") ||
                         (statusFilter === "Ακυρωμένες" && order.status === "cancelled");
    
    const matchesPaymentStatus = paymentStatusFilter === "Όλες" || 
                               (paymentStatusFilter === "Πληρωμένες" && order.paymentStatus === "paid") ||
                               (paymentStatusFilter === "Σε αναμονή" && order.paymentStatus === "pending") ||
                               (paymentStatusFilter === "Επιστροφή χρημάτων" && order.paymentStatus === "refunded");
    
    const orderDate = new Date(order.date);
    const matchesStartDate = !startDate || orderDate >= startDate;
    const matchesEndDate = !endDate || orderDate <= endDate;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesStartDate && matchesEndDate;
  }).sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc" 
        ? new Date(a.date).getTime() - new Date(b.date).getTime() 
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === "total") {
      return sortDirection === "asc" 
        ? a.total - b.total 
        : b.total - a.total;
    } else if (sortField === "id") {
      // Αφαιρούμε το πρόθεμα "ORD-" και συγκρίνουμε τους αριθμούς
      const aNum = parseInt(a.id.replace("ORD-", ""));
      const bNum = parseInt(b.id.replace("ORD-", ""));
      return sortDirection === "asc" 
        ? aNum - bNum 
        : bNum - aNum;
    }
    return 0;
  });

  // Άνοιξε το dialog προβολής παραγγελίας
  const handleViewOrder = (order: any) => {
    setCurrentOrder(order);
    setIsOrderDialogOpen(true);
  };

  // Αλλαγή ταξινόμησης
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Προεπιλεγμένη ταξινόμηση για νέο πεδίο
    }
  };

  // Διαχείριση αλλαγής κατάστασης παραγγελίας
  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus } 
        : order
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ολοκληρώθηκε</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Σε επεξεργασία</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Σε αναμονή</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ακυρώθηκε</Badge>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Πληρώθηκε</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Σε αναμονή</Badge>;
      case "refunded":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Επιστροφή χρημάτων</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('el-GR').format(date);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("Όλες");
    setPaymentStatusFilter("Όλες");
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  // Προσομοιώνουμε την εκτύπωση της παραγγελίας
  const handlePrintOrder = (order: any) => {
    console.log(`Εκτύπωση παραγγελίας: ${order.id}`);
    // Σε πραγματικές συνθήκες, θα χρησιμοποιούσαμε window.print() ή κάποια βιβλιοθήκη εκτύπωσης
  };

  // Προσομοιώνουμε το κατέβασμα του τιμολογίου
  const handleDownloadInvoice = (order: any) => {
    console.log(`Κατέβασμα τιμολογίου: ${order.id}`);
    // Σε πραγματικές συνθήκες, θα δημιουργούσαμε ένα PDF και θα το κατεβάζαμε
  };

  return (
    <AdminLayout title={t('admin.orders')} description={t('admin.orders_description')}>
      {/* Φίλτρα και αναζήτηση */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Αναζήτηση παραγγελιών..."
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
                <SelectItem value="Όλες">Όλες οι καταστάσεις</SelectItem>
                <SelectItem value="Ολοκληρωμένες">Ολοκληρωμένες</SelectItem>
                <SelectItem value="Σε επεξεργασία">Σε επεξεργασία</SelectItem>
                <SelectItem value="Σε αναμονή">Σε αναμονή</SelectItem>
                <SelectItem value="Ακυρωμένες">Ακυρωμένες</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Κατάσταση πληρωμής" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Όλες">Όλες οι πληρωμές</SelectItem>
                <SelectItem value="Πληρωμένες">Πληρωμένες</SelectItem>
                <SelectItem value="Σε αναμονή">Σε αναμονή</SelectItem>
                <SelectItem value="Επιστροφή χρημάτων">Επιστροφή χρημάτων</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            {(searchTerm || statusFilter !== "Όλες" || paymentStatusFilter !== "Όλες" || startDate || endDate) && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Καθαρισμός φίλτρων
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <span className="text-sm text-gray-500">Φιλτράρισμα ανά ημερομηνία:</span>
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: el }) : "Από"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: el }) : "Έως"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {/* Πίνακας παραγγελιών */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                <div className="flex items-center">
                  ID Παραγγελίας
                  {sortField === "id" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "id" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Πελάτης</TableHead>
              <TableHead>Κατάσταση</TableHead>
              <TableHead>Πληρωμή</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center">
                  Ημερομηνία
                  {sortField === "date" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "date" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("total")}>
                <div className="flex items-center justify-end">
                  Σύνολο
                  {sortField === "total" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "total" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.customer.name}</span>
                      <span className="text-gray-500 text-xs">{order.customer.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[140px] border-none bg-transparent p-0 hover:bg-transparent focus:ring-0">
                        <SelectValue placeholder="Επιλέξτε...">
                          {getStatusBadge(order.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Σε αναμονή</Badge>
                        </SelectItem>
                        <SelectItem value="processing">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Σε επεξεργασία</Badge>
                        </SelectItem>
                        <SelectItem value="completed">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ολοκληρώθηκε</Badge>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ακυρώθηκε</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Προβολή
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintOrder(order)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Εκτύπωση
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Τιμολόγιο
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Δεν βρέθηκαν παραγγελίες με τα επιλεγμένα κριτήρια.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog προβολής παραγγελίας */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Παραγγελία {currentOrder?.id}</span>
              {currentOrder && getStatusBadge(currentOrder.status)}
            </DialogTitle>
            <DialogDescription>
              Ημερομηνία: {currentOrder && formatDate(currentOrder.date)}
            </DialogDescription>
          </DialogHeader>
          
          {currentOrder && (
            <div className="mt-4">
              <Tabs defaultValue="details">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="details">Λεπτομέρειες</TabsTrigger>
                  <TabsTrigger value="customer">Στοιχεία Πελάτη</TabsTrigger>
                  <TabsTrigger value="history">Ιστορικό</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Κατάσταση πληρωμής</h3>
                      <div className="mt-1">{getPaymentStatusBadge(currentOrder.paymentStatus)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Μέθοδος πληρωμής</h3>
                      <p className="mt-1">
                        {currentOrder.payment.method}
                        {currentOrder.payment.cardLast4 && ` (**** **** **** ${currentOrder.payment.cardLast4})`}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Προϊόντα</h3>
                    <div className="space-y-3">
                      {currentOrder.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(item.price)} × {item.quantity}
                            </div>
                          </div>
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Υποσύνολο</span>
                      <span>
                        {formatCurrency(
                          currentOrder.items.reduce((acc: number, item: any) => acc + item.total, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Κόστος αποστολής</span>
                      <span>{formatCurrency(currentOrder.shipping.cost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Σύνολο</span>
                      <span>{formatCurrency(currentOrder.total)}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="customer" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Στοιχεία πελάτη</h3>
                      <p className="font-medium">{currentOrder.customer.name}</p>
                      <p className="text-gray-500">{currentOrder.customer.email}</p>
                      <p className="text-gray-500">{currentOrder.customer.phone}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Στοιχεία αποστολής</h3>
                      <p className="font-medium">{currentOrder.shipping.method}</p>
                      {currentOrder.shipping.method !== "Παραλαβή από κατάστημα" && (
                        <>
                          <p className="text-gray-500">{currentOrder.shipping.address.street}</p>
                          <p className="text-gray-500">
                            {currentOrder.shipping.address.postalCode}, {currentOrder.shipping.address.city}
                          </p>
                          <p className="text-gray-500">{currentOrder.shipping.address.country}</p>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <div className="text-sm text-gray-500">
                    Το ιστορικό παραγγελίας θα υλοποιηθεί σε επόμενο στάδιο.
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Κλείσιμο
            </Button>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mb-2 sm:mb-0">
              <Button variant="outline" onClick={() => currentOrder && handlePrintOrder(currentOrder)}>
                <Printer className="h-4 w-4 mr-2" />
                Εκτύπωση
              </Button>
              <Button onClick={() => currentOrder && handleDownloadInvoice(currentOrder)}>
                <FileDown className="h-4 w-4 mr-2" />
                Τιμολόγιο
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 