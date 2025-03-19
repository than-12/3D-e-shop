import { useState, ChangeEvent } from 'react';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  FolderTree, 
  ChevronUp, 
  ChevronDown,
  Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/admin-layout";

// Μοκ δεδομένα κατηγοριών
const mockCategories = [
  {
    id: 1,
    name: 'Ανταλλακτικά 3D Εκτυπωτών',
    slug: 'printer-parts',
    description: 'Ανταλλακτικά και εξαρτήματα για 3D εκτυπωτές',
    productsCount: 24,
    parentId: null,
    icon: 'printer'
  },
  {
    id: 2,
    name: 'Υλικά Εκτύπωσης',
    slug: 'printing-materials',
    description: 'Νήματα και ρητίνες για 3D εκτύπωση',
    productsCount: 35,
    parentId: null,
    icon: 'material'
  },
  {
    id: 3,
    name: 'Νήματα PLA',
    slug: 'pla-filaments',
    description: 'Νήματα PLA για εκτύπωση FDM',
    productsCount: 18,
    parentId: 2,
    icon: 'filament'
  },
  {
    id: 4,
    name: 'Νήματα ABS',
    slug: 'abs-filaments',
    description: 'Νήματα ABS για εκτύπωση FDM',
    productsCount: 12,
    parentId: 2,
    icon: 'filament'
  },
  {
    id: 5,
    name: 'Ρητίνες',
    slug: 'resins',
    description: 'Ρητίνες για εκτύπωση SLA/DLP',
    productsCount: 9,
    parentId: 2,
    icon: 'resin'
  },
  {
    id: 6,
    name: 'Εργαλεία',
    slug: 'tools',
    description: 'Εργαλεία για 3D εκτύπωση και μετεπεξεργασία',
    productsCount: 15,
    parentId: null,
    icon: 'tools'
  },
  {
    id: 7,
    name: 'Αξεσουάρ',
    slug: 'accessories',
    description: 'Αξεσουάρ για 3D εκτύπωση',
    productsCount: 20,
    parentId: null,
    icon: 'accessories'
  }
];

const AdminCategories = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State για τις κατηγορίες και τις λειτουργίες
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showParentCategories, setShowParentCategories] = useState(false);
  
  // State για τα dialogs
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  // Φιλτράρισμα κατηγοριών βάσει αναζήτησης και φίλτρων
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        category.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showParentCategories) {
      return matchesSearch && category.parentId === null;
    }
    
    return matchesSearch;
  });

  // Ταξινόμηση κατηγοριών
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'productsCount') {
      return sortDirection === 'asc' 
        ? a.productsCount - b.productsCount 
        : b.productsCount - a.productsCount;
    }
    return 0;
  });

  // Χειριστής για την αλλαγή του πεδίου ταξινόμησης
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Χειρισμός αλλαγών στην αναζήτηση
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Άνοιγμα του dialog προσθήκης/επεξεργασίας
  const handleAddEditCategory = (category = null) => {
    setEditingCategory(category ? { ...category } : {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      icon: ''
    });
    setShowAddEditDialog(true);
  };

  // Άνοιγμα του dialog διαγραφής
  const handleDeleteCategory = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  // Αποθήκευση κατηγορίας (προσθήκη ή επεξεργασία)
  const handleSaveCategory = () => {
    if (editingCategory.id) {
      // Επεξεργασία υπάρχουσας κατηγορίας
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...editingCategory } : cat
      ));
      toast({
        title: t('admin.category_saved'),
        variant: 'default'
      });
    } else {
      // Προσθήκη νέας κατηγορίας
      const newCategory = {
        ...editingCategory,
        id: Math.max(...categories.map(c => c.id)) + 1,
        productsCount: 0
      };
      setCategories([...categories, newCategory]);
      toast({
        title: t('admin.category_saved'),
        variant: 'default'
      });
    }
    setShowAddEditDialog(false);
  };

  // Διαγραφή κατηγορίας
  const handleConfirmDelete = () => {
    setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
    setShowDeleteDialog(false);
    toast({
      title: t('admin.category_deleted'),
      variant: 'default'
    });
  };

  // Χειρισμός αλλαγών στη φόρμα επεξεργασίας
  const handleInputChange = (field: string, value: any) => {
    setEditingCategory({ ...editingCategory, [field]: value });
  };

  // Λήψη γονικών κατηγοριών για το dropdown
  const parentCategories = categories.filter(cat => cat.parentId === null);

  return (
    <AdminLayout title={t('admin.categories')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.categories')}</h1>
        <Button onClick={() => handleAddEditCategory()}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('admin.add_category')}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              className="pl-10"
              placeholder={`${t('search')}...`}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showParentCategories ? "default" : "outline"}
              onClick={() => setShowParentCategories(!showParentCategories)}
            >
              <FolderTree className="w-4 h-4 mr-2" />
              {showParentCategories ? t('all_categories') : t('parent_categories_only')}
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSortChange('name')} className="cursor-pointer">
                {t('name')} 
                {sortField === 'name' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead>{t('parent_category')}</TableHead>
              <TableHead onClick={() => handleSortChange('productsCount')} className="cursor-pointer">
                {t('product_count')}
                {sortField === 'productsCount' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-primary" />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    {category.parentId 
                      ? categories.find(c => c.id === category.parentId)?.name || '-' 
                      : <span className="text-sm text-gray-500">-</span>
                    }
                  </TableCell>
                  <TableCell>{category.productsCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleAddEditCategory(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {t('no_categories_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog για Προσθήκη/Επεξεργασία Κατηγορίας */}
      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory?.id 
                ? t('admin.edit_category') 
                : t('admin.add_category')
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input 
                id="name" 
                value={editingCategory?.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">{t('slug')}</Label>
              <Input 
                id="slug" 
                value={editingCategory?.slug || ''} 
                onChange={(e) => handleInputChange('slug', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea 
                id="description" 
                value={editingCategory?.description || ''} 
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="parentId">{t('parent_category')}</Label>
              <Select 
                value={editingCategory?.parentId?.toString() || ''} 
                onValueChange={(value) => handleInputChange('parentId', value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_parent_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('none')}</SelectItem>
                  {parentCategories
                    .filter(cat => cat.id !== editingCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">{t('icon')}</Label>
              <Input 
                id="icon" 
                value={editingCategory?.icon || ''} 
                onChange={(e) => handleInputChange('icon', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEditDialog(false)}>
              {t('admin.cancel')}
            </Button>
            <Button onClick={handleSaveCategory}>
              {t('admin.save_changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog για επιβεβαίωση διαγραφής */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.delete_category')}</DialogTitle>
            <DialogDescription>
              {t('confirm_delete_category', { name: categoryToDelete?.name })}
              {categoryToDelete?.productsCount > 0 && (
                <p className="text-destructive mt-2">
                  {t('category_has_products', { count: categoryToDelete.productsCount })}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('admin.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('admin.delete_category')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories; 