// Ορισμός των τύπων για τα στοιχεία του καλαθιού
export interface CartItem {
  id: number;
  userId: number | null;
  productId: number | string;
  quantity: number;
  addedAt: Date;
  product: any; // Χρησιμοποιούμε any για να υποστηρίξουμε διαφορετικούς τύπους προϊόντων
}

// Ορισμός τύπου User για το mock API
interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  role?: 'user' | 'admin';
  password: string; // Αυτό υπάρχει μόνο στο mock API
}

// Mock δεδομένα για χρήστες
export const users: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    fullName: "Διαχειριστής",
    role: "admin"
  },
  {
    id: 2,
    username: "user",
    email: "user@example.com",
    password: "user123",
    fullName: "Απλός Χρήστης",
    role: "user"
  }
];

// Mock δεδομένα για τοπική ανάπτυξη

// Κατηγορίες
export const categories = [
  { 
    id: 1,
    name: "Figurines", 
    slug: "figurines", 
    description: "Detailed figurines for collectors and tabletop gaming", 
    icon: "chess-knight",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 2,
    name: "Home Decor", 
    slug: "home-decor", 
    description: "Decorative items for your home", 
    icon: "home",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 3,
    name: "Gadgets", 
    slug: "gadgets", 
    description: "Useful gadgets and accessories", 
    icon: "cogs",
    imageUrl: null,
    parentId: null
  }
];

// Προϊόντα
export const products = [
  {
    id: 1,
    name: "Dragon Figurine",
    slug: "dragon-figurine",
    description: "Detailed fantasy dragon model, perfect for collectors and tabletop gaming.",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    images: ["https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
    categoryId: 1,
    material: "PLA",
    inStock: true,
    featured: true,
    rating: "4.7",
    reviewCount: 42
  },
  {
    id: 2,
    name: "Adjustable Phone Stand",
    slug: "adjustable-phone-stand",
    description: "Multi-angle smartphone holder, suitable for all devices up to 7 inches.",
    price: "14.99",
    imageUrl: "https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    images: ["https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
    categoryId: 3,
    material: "ABS",
    inStock: true,
    featured: true,
    rating: "5.0",
    reviewCount: 87
  },
  {
    id: 3,
    name: "Decorative Wall Art",
    slug: "decorative-wall-art",
    description: "Beautiful wall art to enhance your home decor.",
    price: "24.99",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
    categoryId: 2,
    material: "PLA",
    inStock: true,
    featured: false,
    rating: "4.5",
    reviewCount: 28
  }
];

// Άδειο καλάθι - τώρα είναι άδειος πίνακας
export const emptyCart: CartItem[] = [];

// Δείγμα προϊόντων καλαθιού με πλήρη στοιχεία προϊόντων
export const sampleCartItems: CartItem[] = [
  {
    id: 1,
    userId: null,
    productId: 1,
    quantity: 1,
    addedAt: new Date(),
    product: products[0]
  },
  {
    id: 2,
    userId: null,
    productId: 2,
    quantity: 2,
    addedAt: new Date(),
    product: products[1]
  }
];

// Χρησιμοποιούμε ένα τοπικό μεταβλητό καλάθι για την αποθήκευση της κατάστασης
let currentCart: CartItem[] = [...sampleCartItems]; // Αρχικοποιούμε με δείγμα προϊόντων

// Mock APIs
export const mockApi = {
  // Login API
  login: (usernameOrEmail: string, password: string) => {
    console.log("Mock API: Προσπάθεια σύνδεσης χρήστη:", usernameOrEmail);
    
    const user = users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
      u.password === password
    );
    
    if (user) {
      // Επιστρέφουμε τον χρήστη χωρίς τον κωδικό πρόσβασης
      const { password, ...userWithoutPassword } = user;
      console.log("Mock API: Επιτυχής σύνδεση για τον χρήστη:", userWithoutPassword.username);
      return Promise.resolve({ user: userWithoutPassword });
    }
    
    console.log("Mock API: Αποτυχία σύνδεσης για τον χρήστη:", usernameOrEmail);
    return Promise.reject(new Error('Λάθος όνομα χρήστη ή κωδικός πρόσβασης'));
  },
  
  // Λήψη όλων των κατηγοριών
  getCategories: () => {
    return Promise.resolve(categories);
  },
  
  // Λήψη όλων των προϊόντων
  getProducts: () => {
    return Promise.resolve(products);
  },
  
  // Λήψη προϊόντος με βάση το slug
  getProductBySlug: (slug: string) => {
    const product = products.find(p => p.slug === slug);
    if (product) {
      return Promise.resolve(product);
    }
    return Promise.reject(new Error('Product not found'));
  },
  
  // Λήψη καλαθιού - επιστρέφουμε το τρέχον καλάθι
  getCart: () => {
    console.log("Επιστροφή τρέχοντος καλαθιού με", currentCart.length, "αντικείμενα");
    return Promise.resolve(currentCart);
  },
  
  // Υπολογισμός κόστους εκτύπωσης 3D (Mock για /api/custom-prints/calculate)
  calculateCustomPrint: (data: any) => {
    console.log("Mock API: Υπολογισμός κόστους εκτύπωσης 3D:", data);
    
    // Εξαγωγή των απαραίτητων δεδομένων
    const { material, quality, infill, stlMetadata } = data;
    
    // Υπολογισμός βάρους με βάση το υλικό και τον όγκο
    const density = material === 'abs' ? 1.04 : material === 'petg' ? 1.27 : material === 'tpu' ? 1.21 : 1.24;
    const weight = stlMetadata.volume * density;
    
    // Υπολογισμός χρόνου εκτύπωσης 
    const qualityFactor = quality === 'draft' ? 0.6 : quality === 'fine' ? 1.5 : 1;
    const infillFactor = infill / 100 * 0.8 + 0.2; // 20% χρόνος για το περίγραμμα
    const printTime = Math.round(stlMetadata.volume * 2 * qualityFactor * infillFactor);
    
    // Υπολογισμός κόστους σε EUR
    const materialCost = Math.round(weight * 0.045 * 100) / 100; // ~4.5 cents per gram
    const printTimeCost = Math.round(printTime * 0.09 / 60 * 100) / 100; // ~€5.40 per hour
    const setupFee = 4.5; // €4.50 setup fee
    
    // Complexity based on triangle count
    let complexity = "medium";
    if (stlMetadata.triangles < 5000) complexity = "simple";
    else if (stlMetadata.triangles > 50000) complexity = "complex";
    
    const totalCost = Math.round((materialCost + printTimeCost + setupFee) * 100) / 100;
    
    // Δημιουργία του αποτελέσματος
    const result = {
      id: Date.now(), // Μοναδικό ID
      fileName: data.fileName || 'model.stl',
      fileSize: data.fileSize || 0,
      material,
      quality,
      infill,
      volume: stlMetadata.volume,
      weight,
      printTime,
      complexity,
      materialCost,
      printTimeCost,
      setupFee,
      totalCost,
      stlMetadata
    };
    
    return Promise.resolve(result);
  },
  
  // Δημιουργία προσαρμοσμένης εκτύπωσης (Mock για /api/custom-prints)
  createCustomPrint: (data: any) => {
    console.log("Mock API: Δημιουργία προσαρμοσμένης εκτύπωσης:", {
      ...data,
      photoUrl: data.photoUrl ? "Photo URL exists (truncated for logs)" : undefined
    });
    
    // Δημιουργία αποτελέσματος με μοναδικό ID
    const result = {
      id: `custom-${Date.now()}`,
      ...data,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(result);
  },
  
  // Προσθήκη στο καλάθι - τώρα υποστηρίζει και string IDs και custom δεδομένα
  addToCart: (productId: number | string, quantity: number = 1, customData?: any) => {
    // Ειδική διαχείριση για προσαρμοσμένες εκτυπώσεις
    if (customData && customData.customPrintId) {
      console.log("Προσθήκη custom 3D print με id:", customData.customPrintId);
      
      const newItem: CartItem = {
        id: Date.now(),
        userId: null,
        productId: customData.customPrintId,
        quantity: quantity,
        addedAt: new Date(),
        product: {
          id: customData.customPrintId,
          name: `Custom 3D Print (${customData.fileName || 'model.stl'})`,
          price: customData.totalCost?.toString() || "25.00",
          imageUrl: customData.photoUrl || "/images/3d-print-placeholder.jpg",
          images: [customData.photoUrl || "/images/3d-print-placeholder.jpg"],
          inStock: true,
          isCustomPrint: true,
          material: customData.material || 'PLA',
          quality: customData.quality || 'standard',
          infill: customData.infill || 20
        }
      };
      
      currentCart = [...currentCart, newItem];
      console.log(`Προστέθηκε το custom 3D print στο καλάθι. Τρέχων αριθμός αντικειμένων: ${currentCart.length}`);
      return Promise.resolve(newItem);
    }
    
    // Διαχείριση για lithophane προϊόντα
    if (typeof productId === 'string' && productId.startsWith('lithophane-')) {
      console.log(`Προσθήκη custom lithophane με id ${productId} στο καλάθι`);
      
      const newItem: CartItem = {
        id: Date.now(), // Μοναδικό ID για το αντικείμενο καλαθιού
        userId: null,
        productId,
        quantity,
        addedAt: new Date(),
        product: customData || {
          id: productId,
          name: `Custom Lithophane`,
          price: "19.99", // Προεπιλεγμένη τιμή αν δεν παρέχεται
          imageUrl: "/images/lithophane-placeholder.jpg",
          images: ["/images/lithophane-placeholder.jpg"],
          inStock: true
        }
      };
      
      currentCart = [...currentCart, newItem];
      console.log(`Προστέθηκε το custom lithophane στο καλάθι. Τρέχων αριθμός αντικειμένων: ${currentCart.length}`);
      return Promise.resolve(newItem);
    }
    
    // Κανονική ροή για τυπικά προϊόντα με αριθμητικό ID
    // Βρίσκουμε το αντίστοιχο προϊόν
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return Promise.reject(new Error(`Το προϊόν με id ${productId} δεν βρέθηκε`));
    }
    
    // Ελέγχουμε αν το προϊόν υπάρχει ήδη στο καλάθι
    const existingItemIndex = currentCart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Αν υπάρχει ήδη, αυξάνουμε την ποσότητα
      const updatedItem: CartItem = {
        ...currentCart[existingItemIndex],
        quantity: currentCart[existingItemIndex].quantity + quantity
      };
      
      currentCart = [
        ...currentCart.slice(0, existingItemIndex),
        updatedItem,
        ...currentCart.slice(existingItemIndex + 1)
      ];
      
      console.log(`Ενημερώθηκε η ποσότητα του προϊόντος ${productId} στο καλάθι. Νέα ποσότητα: ${updatedItem.quantity}`);
      return Promise.resolve(updatedItem);
    } else {
      // Αν δεν υπάρχει, το προσθέτουμε
      const newItem: CartItem = {
        id: Date.now(), // Μοναδικό ID
        userId: null,
        productId,
        quantity,
        addedAt: new Date(),
        product: product
      };
      
      currentCart = [...currentCart, newItem];
      
      console.log(`Προστέθηκε το προϊόν ${productId} στο καλάθι. Τρέχων αριθμός αντικειμένων: ${currentCart.length}`);
      return Promise.resolve(newItem);
    }
  },
  
  // Διαγραφή από το καλάθι
  removeFromCart: (itemId: number) => {
    const itemIndex = currentCart.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart = [
        ...currentCart.slice(0, itemIndex),
        ...currentCart.slice(itemIndex + 1)
      ];
      
      console.log(`Αφαιρέθηκε το αντικείμενο ${itemId} από το καλάθι. Τρέχων αριθμός αντικειμένων: ${currentCart.length}`);
    } else {
      console.log(`Το αντικείμενο ${itemId} δεν βρέθηκε στο καλάθι.`);
    }
    
    return Promise.resolve({ success: true });
  },
  
  // Καθαρισμός καλαθιού
  clearCart: () => {
    currentCart = [];
    console.log("Το καλάθι εκκαθαρίστηκε.");
    return Promise.resolve({ success: true });
  },
  
  // ===== Email API functions =====
  // Αποστολή email επιβεβαίωσης παραγγελίας
  sendOrderConfirmationEmail: (orderId: string, userId: string) => {
    console.log(`Mock API: Αποστολή email επιβεβαίωσης για την παραγγελία #${orderId} στον χρήστη ${userId}`);
    return Promise.resolve({ success: true, message: 'Το email επιβεβαίωσης παραγγελίας στάλθηκε με επιτυχία' });
  },
  
  // Αποστολή email ειδοποίησης αποστολής παραγγελίας
  sendOrderShippedEmail: (orderId: string, userId: string, trackingNumber: string) => {
    console.log(`Mock API: Αποστολή email ειδοποίησης αποστολής για την παραγγελία #${orderId} στον χρήστη ${userId} με αριθμό παρακολούθησης ${trackingNumber}`);
    return Promise.resolve({ success: true, message: 'Το email ειδοποίησης αποστολής στάλθηκε με επιτυχία' });
  },
  
  // Αποστολή email καλωσορίσματος
  sendWelcomeEmail: (userId: string) => {
    console.log(`Mock API: Αποστολή email καλωσορίσματος στον χρήστη ${userId}`);
    return Promise.resolve({ success: true, message: 'Το email καλωσορίσματος στάλθηκε με επιτυχία' });
  },
  
  // Αποστολή email επαναφοράς κωδικού
  sendPasswordResetEmail: (email: string) => {
    console.log(`Mock API: Αποστολή email επαναφοράς κωδικού στη διεύθυνση ${email}`);
    return Promise.resolve({ success: true, message: 'Το email επαναφοράς κωδικού στάλθηκε με επιτυχία' });
  },
  
  // Αποστολή newsletter
  sendNewsletter: (subject: string, template: string, data: any) => {
    console.log(`Mock API: Αποστολή newsletter με θέμα "${subject}" χρησιμοποιώντας το template "${template}" και δεδομένα:`, data);
    return Promise.resolve({ success: true, message: 'Το newsletter στάλθηκε με επιτυχία σε όλους τους εγγεγραμμένους χρήστες' });
  }
}; 