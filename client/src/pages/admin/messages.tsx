import { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  Star, 
  Eye, 
  Trash2, 
  Reply, 
  ChevronUp, 
  ChevronDown,
  Clock,
  User,
  AtSign,
  Filter,
  Inbox,
  AlertTriangle,
  MessageSquare,
  Archive
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/admin/admin-layout";

// Μοκ δεδομένα μηνυμάτων
const mockMessages = [
  {
    id: 1,
    senderName: 'Γιώργος Παπαδόπουλος',
    email: 'gpapadopoulos@example.com',
    subject: 'Ερώτηση για προσαρμοσμένη παραγγελία',
    message: 'Καλησπέρα σας, θα ήθελα να μάθω εάν μπορείτε να εκτυπώσετε ένα ειδικό σχέδιο που έχω. Έχω τα αρχεία STL έτοιμα. Παρακαλώ ενημερώστε με για το κόστος και το χρόνο παράδοσης. Ευχαριστώ!',
    receivedAt: '2023-11-24T14:30:00',
    status: 'unread',
    isStarred: false,
    category: 'inquiry'
  },
  {
    id: 2,
    senderName: 'Μαρία Κωνσταντίνου',
    email: 'mkonstantinou@example.com',
    subject: 'Πρόβλημα με την παραγγελία #10045',
    message: 'Γεια σας, έχω ένα πρόβλημα με την παραγγελία μου #10045. Το προϊόν που έλαβα έχει ατέλειες στην επιφάνεια. Μπορείτε να με βοηθήσετε με αυτό το θέμα; Σας ευχαριστώ εκ των προτέρων.',
    receivedAt: '2023-11-23T09:15:00',
    status: 'read',
    isStarred: true,
    category: 'support'
  },
  {
    id: 3,
    senderName: 'Δημήτρης Αλεξίου',
    email: 'dalexiou@example.com',
    subject: 'Πρόταση συνεργασίας',
    message: 'Αγαπητοί συνεργάτες, εκπροσωπώ μια εταιρεία που αναζητά συνεργασία για μαζική παραγωγή 3D εξαρτημάτων. Θα ήθελα να συζητήσουμε τις δυνατότητες συνεργασίας μας. Είμαστε διαθέσιμοι για τηλεδιάσκεψη όποτε σας βολεύει. Με εκτίμηση, Δημήτρης Αλεξίου',
    receivedAt: '2023-11-22T16:45:00',
    status: 'read',
    isStarred: true,
    category: 'business'
  },
  {
    id: 4,
    senderName: 'Ελένη Παπανδρέου',
    email: 'epapandreou@example.com',
    subject: 'Ευχαριστήριο μήνυμα',
    message: 'Θέλω να σας ευχαριστήσω για την εξαιρετική εξυπηρέτηση και την ποιότητα του προϊόντος που παραλάβαμε. Είναι ακριβώς αυτό που χρειαζόμασταν και η ποιότητα εκτύπωσης είναι εξαιρετική. Θα σας συστήσω σίγουρα σε φίλους και συνεργάτες!',
    receivedAt: '2023-11-21T11:20:00',
    status: 'read',
    isStarred: false,
    category: 'feedback'
  },
  {
    id: 5,
    senderName: 'Κώστας Δημητρίου',
    email: 'kdimitriou@example.com',
    subject: 'Ερώτηση για χρωματισμό εκτυπώσεων',
    message: 'Γεια σας, θα ήθελα να ρωτήσω εάν προσφέρετε χρωματιστές εκτυπώσεις και ποιες είναι οι επιλογές χρωμάτων που διαθέτετε. Επίσης, υπάρχει επιπλέον κόστος για τον χρωματισμό; Ευχαριστώ για το χρόνο σας.',
    receivedAt: '2023-11-20T13:10:00',
    status: 'unread',
    isStarred: false,
    category: 'inquiry'
  },
  {
    id: 6,
    senderName: 'Σοφία Αντωνίου',
    email: 'santoniou@example.com',
    subject: 'Καθυστέρηση παράδοσης',
    message: 'Καλησπέρα, η παραγγελία μου #10056 έπρεπε να είχε παραδοθεί χθες, αλλά ακόμα δεν την έχω λάβει. Μπορείτε να ελέγξετε την κατάσταση της παραγγελίας μου; Ευχαριστώ πολύ.',
    receivedAt: '2023-11-19T10:30:00',
    status: 'read',
    isStarred: false,
    category: 'support'
  },
  {
    id: 7,
    senderName: 'Νίκος Γεωργίου',
    email: 'ngeorgiou@example.com',
    subject: 'Διαθεσιμότητα υλικών',
    message: 'Καλησπέρα σας, ενδιαφέρομαι να μάθω εάν έχετε τη δυνατότητα εκτύπωσης με βιοδιασπώμενα υλικά PLA. Έχω ένα project που απαιτεί φιλικά προς το περιβάλλον υλικά. Μπορείτε να με ενημερώσετε για τις επιλογές σας; Ευχαριστώ προκαταβολικά.',
    receivedAt: '2023-11-18T15:45:00',
    status: 'unread',
    isStarred: false,
    category: 'inquiry'
  }
];

const AdminMessages = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State για τα μηνύματα και τις λειτουργίες
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('receivedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State για τα dialogs
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  // Φιλτράρισμα μηνυμάτων βάσει αναζήτησης και φίλτρων
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    if (categoryFilter === 'unread') return matchesSearch && message.status === 'unread';
    if (categoryFilter === 'starred') return matchesSearch && message.isStarred;
    return matchesSearch && message.category === categoryFilter;
  });

  // Ταξινόμηση μηνυμάτων
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortField === 'receivedAt') {
      return sortDirection === 'asc' 
        ? new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime() 
        : new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    } else if (sortField === 'senderName') {
      return sortDirection === 'asc' 
        ? a.senderName.localeCompare(b.senderName) 
        : b.senderName.localeCompare(a.senderName);
    } else if (sortField === 'subject') {
      return sortDirection === 'asc' 
        ? a.subject.localeCompare(b.subject) 
        : b.subject.localeCompare(a.subject);
    }
    return 0;
  });

  // Διαχείριση των επιλεγμένων μηνυμάτων όταν αλλάζει το φιλτράρισμα
  useEffect(() => {
    if (selectAll) {
      setSelectedMessages(filteredMessages.map(message => message.id));
    } else {
      // Διατήρηση μόνο των επιλεγμένων που εξακολουθούν να είναι στο φιλτραρισμένο αποτέλεσμα
      setSelectedMessages(prev => 
        prev.filter(id => filteredMessages.some(message => message.id === id))
      );
    }
  }, [filteredMessages, selectAll]);

  // Χειριστής για την αλλαγή του πεδίου ταξινόμησης
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Χειρισμός αλλαγών στην αναζήτηση
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Άνοιγμα του dialog λεπτομερειών μηνύματος
  const handleViewMessage = (message: any) => {
    // Ενημέρωση κατάστασης μηνύματος σε "διαβασμένο"
    if (message.status === 'unread') {
      setMessages(messages.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ));
    }
    
    setSelectedMessage(message);
    setReplyText('');
    setShowMessageDetails(true);
  };

  // Επισήμανση μηνύματος με αστέρι
  const toggleStar = (messageId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          isStarred: !message.isStarred
        };
      }
      return message;
    }));
  };

  // Διαγραφή μηνυμάτων
  const deleteMessages = (messageIds: number[]) => {
    setMessages(messages.filter(message => !messageIds.includes(message.id)));
    setSelectedMessages(prev => prev.filter(id => !messageIds.includes(id)));
    
    toast({
      title: t('messages_deleted'),
      description: t('selected_messages_deleted'),
      variant: 'default'
    });
  };

  // Διαχείριση επιλογής όλων των μηνυμάτων
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMessages(filteredMessages.map(message => message.id));
    } else {
      setSelectedMessages([]);
    }
  };

  // Διαχείριση επιλογής μεμονωμένου μηνύματος
  const handleSelectMessage = (messageId: number, checked: boolean) => {
    if (checked) {
      setSelectedMessages(prev => [...prev, messageId]);
    } else {
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  // Αποστολή απάντησης
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    // Σε πραγματική εφαρμογή θα στέλναμε το email μέσω API
    toast({
      title: t('reply_sent'),
      description: t('reply_sent_to', { name: selectedMessage.senderName }),
      variant: 'default'
    });
    
    setReplyText('');
    setShowMessageDetails(false);
  };

  // Μορφοποίηση ημερομηνίας
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Αν είναι σήμερα, εμφάνισε μόνο την ώρα
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Αν είναι χθες, εμφάνισε "Χθες" και την ώρα
    if (date.toDateString() === yesterday.toDateString()) {
      return `Χθες, ${date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Διαφορετικά εμφάνισε πλήρη ημερομηνία
    return date.toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Συντόμευση μηνύματος για το preview
  const truncateText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <AdminLayout title={t('admin.messages')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.messages')}</h1>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('filter_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <Inbox className="w-4 h-4 mr-2" />
                    {t('all_messages')}
                  </div>
                </SelectItem>
                <SelectItem value="unread">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {t('unread')}
                  </div>
                </SelectItem>
                <SelectItem value="starred">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    {t('starred')}
                  </div>
                </SelectItem>
                <SelectItem value="inquiry">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('inquiries')}
                  </div>
                </SelectItem>
                <SelectItem value="support">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {t('support')}
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-2" />
                    {t('business')}
                  </div>
                </SelectItem>
                <SelectItem value="feedback">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('feedback')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Γραμμή εργαλείων */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Checkbox 
              checked={selectAll} 
              onCheckedChange={handleSelectAll}
              className="mr-2"
            />
            {selectedMessages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteMessages(selectedMessages)}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete_selected')}
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredMessages.length} {t('of')} {messages.length} {t('messages')}
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead onClick={() => handleSortChange('senderName')} className="cursor-pointer">
                {t('sender')} 
                {sortField === 'senderName' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead onClick={() => handleSortChange('subject')} className="cursor-pointer">
                {t('subject')} 
                {sortField === 'subject' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead onClick={() => handleSortChange('receivedAt')} className="cursor-pointer text-right">
                {t('received')} 
                {sortField === 'receivedAt' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMessages.length > 0 ? (
              sortedMessages.map((message) => (
                <TableRow 
                  key={message.id} 
                  className={`${message.status === 'unread' ? 'font-semibold bg-gray-50' : 'font-normal'} cursor-pointer hover:bg-gray-100`}
                  onClick={() => handleViewMessage(message)}
                >
                  <TableCell className="w-8">
                    <Checkbox 
                      checked={selectedMessages.includes(message.id)} 
                      onCheckedChange={(checked) => handleSelectMessage(message.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-2"
                    />
                  </TableCell>
                  <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="focus:outline-none"
                      onClick={(e) => toggleStar(message.id, e)}
                    >
                      <Star 
                        className={`w-4 h-4 ${message.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{message.senderName}</span>
                      <span className="text-xs text-gray-500">{message.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{message.subject}</span>
                      <span className="text-xs text-gray-500">{truncateText(message.message)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm">{formatDate(message.receivedAt)}</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs mt-1"
                      >
                        {message.category === 'inquiry' && t('inquiry')}
                        {message.category === 'support' && t('support')}
                        {message.category === 'business' && t('business')}
                        {message.category === 'feedback' && t('feedback')}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {t('no_messages_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog λεπτομερειών μηνύματος */}
      <Dialog open={showMessageDetails} onOpenChange={setShowMessageDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{selectedMessage?.senderName}</div>
                  <div className="text-sm text-gray-500">{selectedMessage?.email}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {selectedMessage && formatDate(selectedMessage.receivedAt)}
              </div>
            </div>
            
            <div className="min-h-[150px]">
              {selectedMessage?.message}
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Reply className="w-4 h-4 mr-2" />
                {t('reply')}
              </h3>
              <Textarea 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('type_your_reply')}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => toggleStar(selectedMessage?.id)}
              >
                <Star 
                  className={`w-4 h-4 mr-2 ${selectedMessage?.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} 
                />
                {selectedMessage?.isStarred ? t('remove_star') : t('add_star')}
              </Button>
              <Button 
                variant="ghost" 
                className="text-red-500"
                onClick={() => {
                  deleteMessages([selectedMessage?.id]);
                  setShowMessageDetails(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
            <div>
              <Button variant="outline" className="mr-2" onClick={() => setShowMessageDetails(false)}>
                {t('close')}
              </Button>
              <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                <Reply className="w-4 h-4 mr-2" />
                {t('send_reply')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages; 