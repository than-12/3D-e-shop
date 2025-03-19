import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  MoreHorizontal, 
  ChevronDown, 
  Check, 
  X,
  ArrowUpDown
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Σύνθεση δοκιμαστικών δεδομένων - αυτά θα έρχονται από το API
const mockProducts = [
  {
    id: 1,
    name: "Φιγούρα Darth Vader",
    sku: "FIG-SW-001",
    price: 39.99,
    stock: 25,
    category: "Φιγούρες",
    status: "active",
    createdAt: "2023-04-12",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 2,
    name: "Βάση για κινητό τηλέφωνο",
    sku: "ACC-PH-002",
    price: 14.99,
    stock: 52,
    category: "Αξεσουάρ",
    status: "active",
    createdAt: "2023-04-15",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 3,
    name: "Κουτί Αποθήκευσης με LED",
    sku: "HOM-ST-003",
    price: 24.99,
    stock: 8,
    category: "Σπίτι",
    status: "low-stock",
    createdAt: "2023-04-20",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 4,
    name: "Σετ Μηχανικά Γρανάζια",
    sku: "ENG-PT-004",
    price: 29.99,
    stock: 0,
    category: "Μηχανολογικά",
    status: "out-of-stock",
    createdAt: "2023-05-01",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 5,
    name: "Μινιατούρα Πύργος του Άιφελ",
    sku: "MOD-LM-005",
    price: 19.99,
    stock: 30,
    category: "Μινιατούρες",
    status: "active",
    createdAt: "2023-05-05",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 6,
    name: "Διακοσμητικά Λουλούδια",
    sku: "HOM-DC-006",
    price: 9.99,
    stock: 18,
    category: "Σπίτι",
    status: "active",
    createdAt: "2023-05-10",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 7,
    name: "Σετ Κοσμημάτων",
    sku: "ACC-JW-007",
    price: 49.99,
    stock: 5,
    category: "Αξεσουάρ",
    status: "low-stock",
    createdAt: "2023-05-15",
    thumbnail: "https://via.placeholder.com/50x50"
  },
  {
    id: 8,
    name: "Βάση για Tablet",
    sku: "ACC-TB-008",
    price: 19.99,
    stock: 0,
    category: "Αξεσουάρ",
    status: "out-of-stock",
    createdAt: "2023-05-20",
    thumbnail: "https://via.placeholder.com/50x50"
  },
];

const mockCategories = [
  "Όλες οι κατηγορίες",
  "Φιγούρες",
  "Αξεσουάρ",
  "Σπίτι",
  "Μηχανολογικά",
  "Μινιατούρες"
];

export default function AdminProducts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Καταστάσεις για τη σελίδα
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Όλες οι κατηγορίες");
  const [statusFilter, setStatusFilter] = useState("Όλες");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Καταστάσεις για dialogs
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  
  // Κατάσταση για την επεξεργασία προϊόντος
  const [editForm, setEditForm] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    status: "active"
  });
  
  // Φίλτραρε και ταξινόμησε τα προϊόντα
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Όλες οι κατηγορίες" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "Όλες" || 
                         (statusFilter === "Διαθέσιμα" && product.status === "active") ||
                         (statusFilter === "Χαμηλό στοκ" && product.status === "low-stock") ||
                         (statusFilter === "Εξαντλημένα" && product.status === "out-of-stock");
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === "price") {
      return sortDirection === "asc" 
        ? a.price - b.price 
        : b.price - a.price;
    } else if (sortField === "stock") {
      return sortDirection === "asc" 
        ? a.stock - b.stock 
        : b.stock - a.stock;
    }
    return 0;
  });

  // Άνοιξε το dialog για προσθήκη/επεξεργασία προϊόντος
  const handleEditProduct = (product: any = null) => {
    if (product) {
      // Επεξεργασία υπάρχοντος προϊόντος
      setEditForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        category: product.category,
        description: product.description || "",
        status: product.status
      });
    } else {
      // Προσθήκη νέου προϊόντος
      setEditForm({
        name: "",
        sku: "",
        price: 0,
        stock: 0,
        category: mockCategories[1], // Default: Πρώτη πραγματική κατηγορία
        description: "",
        status: "active"
      });
    }
    setCurrentProduct(product);
    setIsProductDialogOpen(true);
  };

  // Άνοιξε το dialog για διαγραφή προϊόντος
  const handleDeleteClick = (product: any) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Διαγραφή προϊόντος
  const handleDeleteProduct = () => {
    setProducts(products.filter(p => p.id !== currentProduct.id));
    setIsDeleteDialogOpen(false);
    toast({
      title: "Προϊόν διαγράφηκε επιτυχώς",
      description: `Το προϊόν "${currentProduct?.name}" διαγράφηκε επιτυχώς.`,
    });
  };

  // Αποθήκευση προϊόντος (νέο ή ενημέρωση)
  const handleSaveProduct = () => {
    if (currentProduct) {
      // Ενημέρωση υπάρχοντος προϊόντος
      setProducts(products.map(p => 
        p.id === currentProduct.id ? 
        { ...p, 
          name: editForm.name,
          sku: editForm.sku,
          price: editForm.price,
          stock: editForm.stock,
          category: editForm.category,
          description: editForm.description,
          status: editForm.status
        } : p
      ));
    } else {
      // Προσθήκη νέου προϊόντος
      const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: editForm.name,
        sku: editForm.sku,
        price: editForm.price,
        stock: editForm.stock,
        category: editForm.category,
        status: editForm.status,
        description: editForm.description,
        createdAt: new Date().toISOString().split('T')[0],
        thumbnail: "https://via.placeholder.com/50x50"
      };
      setProducts([...products, newProduct]);
    }
    setIsProductDialogOpen(false);
    toast({
      title: "Προϊόν αποθηκεύτηκε επιτυχώς",
      description: `Το προϊόν "${editForm.name}" αποθηκεύτηκε επιτυχώς.`,
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

  // Διαχείριση αλλαγών στη φόρμα
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Για αριθμητικά πεδία, μετατρέπουμε την τιμή σε αριθμό
    if (name === 'price' || name === 'stock') {
      setEditForm({
        ...editForm,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditForm({
        ...editForm,
        [name]: value
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Διαθέσιμο</Badge>;
      case "low-stock":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Χαμηλό στοκ</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Εξαντλημένο</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <AdminLayout title={t('admin.products')} description={t('admin.products_description')}>
      {/* Φίλτρα και αναζήτηση */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Αναζήτηση προϊόντων..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Κατηγορία" />
            </SelectTrigger>
            <SelectContent>
              {mockCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Κατάσταση" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Όλες">Όλες οι καταστάσεις</SelectItem>
              <SelectItem value="Διαθέσιμα">Διαθέσιμα</SelectItem>
              <SelectItem value="Χαμηλό στοκ">Χαμηλό στοκ</SelectItem>
              <SelectItem value="Εξαντλημένα">Εξαντλημένα</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => handleEditProduct()} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.add_product')}
        </Button>
      </div>
      
      {/* Πίνακας προϊόντων */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Εικόνα</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Προϊόν
                  {sortField === "name" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "name" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                <div className="flex items-center">
                  Τιμή
                  {sortField === "price" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "price" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("stock")}>
                <div className="flex items-center">
                  Απόθεμα
                  {sortField === "stock" && (
                    sortDirection === "asc" ? 
                    <ChevronDown className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                  )}
                  {sortField !== "stock" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Κατηγορία</TableHead>
              <TableHead>Κατάσταση</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-500">{product.sku}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Επεξεργασία
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Διαγραφή
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Δεν βρέθηκαν προϊόντα με τα επιλεγμένα κριτήρια.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog προσθήκης/επεξεργασίας προϊόντος */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Επεξεργασία Προϊόντος" : "Προσθήκη Νέου Προϊόντος"}
            </DialogTitle>
            <DialogDescription>
              Συμπληρώστε τα παρακάτω στοιχεία για το προϊόν. Πατήστε Αποθήκευση όταν τελειώσετε.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Όνομα Προϊόντος</label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                placeholder="π.χ. Φιγούρα Darth Vader"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="sku" className="text-sm font-medium">Κωδικός SKU</label>
              <Input
                id="sku"
                name="sku"
                value={editForm.sku}
                onChange={handleInputChange}
                placeholder="π.χ. FIG-SW-001"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="price" className="text-sm font-medium">Τιμή (€)</label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={editForm.price}
                onChange={handleInputChange}
                placeholder="π.χ. 39.99"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">Απόθεμα</label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={editForm.stock}
                onChange={handleInputChange}
                placeholder="π.χ. 25"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Κατηγορία</label>
              <Select 
                name="category" 
                value={editForm.category} 
                onValueChange={(value) => setEditForm({...editForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατηγορία" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Κατάσταση</label>
              <Select 
                name="status" 
                value={editForm.status} 
                onValueChange={(value) => setEditForm({...editForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατάσταση" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Διαθέσιμο</SelectItem>
                  <SelectItem value="low-stock">Χαμηλό Στοκ</SelectItem>
                  <SelectItem value="out-of-stock">Εξαντλημένο</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">Περιγραφή</label>
              <textarea 
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Περιγράψτε το προϊόν..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Ακύρωση
            </Button>
            <Button onClick={handleSaveProduct}>Αποθήκευση</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Διάλογος επιβεβαίωσης διαγραφής */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;</AlertDialogTitle>
            <AlertDialogDescription>
              Η διαγραφή του προϊόντος "{currentProduct?.name}" είναι μόνιμη και δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 