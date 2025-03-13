import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  customPrints, type CustomPrint, type InsertCustomPrint,
  contactMessages, type ContactMessage, type InsertContactMessage,
  lithophanes, type Lithophane, type InsertLithophane
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart
  getCartItems(userId?: number): Promise<CartItem[]>;
  getCartItemWithProduct(cartItemId: number): Promise<(CartItem & { product: Product }) | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId?: number): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  getUserOrders(userId?: number): Promise<Order[]>;
  
  // Custom Prints
  calculatePrintCost(printDetails: Partial<InsertCustomPrint>): Promise<CustomPrint>;
  saveCustomPrint(customPrint: InsertCustomPrint): Promise<CustomPrint>;
  getCustomPrints(userId?: number): Promise<CustomPrint[]>;
  
  // Lithophane Prints
  calculateLithophaneCost(lithophaneDetails: Partial<InsertLithophane>): Promise<Lithophane>;
  saveLithophane(lithophane: InsertLithophane): Promise<Lithophane>;
  getLithophanes(userId?: number): Promise<Lithophane[]>;
  getLithophaneById(id: number): Promise<Lithophane | undefined>;
  
  // Contact 
  saveContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private customPrints: Map<number, CustomPrint>;
  private contactMessages: Map<number, ContactMessage>;
  private lithophanes: Map<number, Lithophane>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private cartItemIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private customPrintIdCounter: number;
  private contactMessageIdCounter: number;
  private lithophaneIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.customPrints = new Map();
    this.contactMessages = new Map();
    this.lithophanes = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.cartItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.customPrintIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.lithophaneIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add categories
    const categoriesData: InsertCategory[] = [
      { 
        name: "Figurines", 
        slug: "figurines", 
        description: "Detailed figurines for collectors and tabletop gaming", 
        icon: "chess-knight" 
      },
      { 
        name: "Home Decor", 
        slug: "home-decor", 
        description: "Decorative items for your home", 
        icon: "home" 
      },
      { 
        name: "Gadgets", 
        slug: "gadgets", 
        description: "Useful gadgets and accessories", 
        icon: "cogs" 
      },
      { 
        name: "Tools", 
        slug: "tools", 
        description: "Practical tools and utilities", 
        icon: "wrench" 
      },
      { 
        name: "Gaming", 
        slug: "gaming", 
        description: "Gaming accessories and props", 
        icon: "gamepad" 
      },
      { 
        name: "Custom", 
        slug: "custom", 
        description: "Custom 3D prints from your design", 
        icon: "lightbulb" 
      }
    ];
    
    categoriesData.forEach(category => this.createCategory(category));
    
    // Add products
    const productsData: InsertProduct[] = [
      {
        name: "Dragon Figurine",
        slug: "dragon-figurine",
        description: "Detailed fantasy dragon model, perfect for collectors and tabletop gaming.",
        price: "29.99",
        imageUrl: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 1,
        material: "PLA",
        inStock: true,
        featured: true
      },
      {
        name: "Adjustable Phone Stand",
        slug: "adjustable-phone-stand",
        description: "Multi-angle smartphone holder, suitable for all devices up to 7 inches.",
        price: "14.99",
        imageUrl: "https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 3,
        material: "ABS",
        inStock: true,
        featured: true
      },
      {
        name: "Honeycomb Desk Organizer",
        slug: "honeycomb-desk-organizer",
        description: "Modular organizer for pens, cards, and office supplies with unique hexagonal design.",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 2,
        material: "PLA",
        inStock: true,
        featured: true
      },
      {
        name: "Modern Planter Set",
        slug: "modern-planter-set",
        description: "Set of 3 geometric planters for succulents and small houseplants.",
        price: "34.99",
        imageUrl: "https://images.unsplash.com/photo-1560849260-9a23312ca75f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1560849260-9a23312ca75f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 2,
        material: "PETG",
        inStock: true,
        featured: true
      },
      {
        name: "Cable Organizer",
        slug: "cable-organizer",
        description: "Keep your desk tidy with this cable management solution.",
        price: "9.99",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 3,
        material: "PLA",
        inStock: true,
        featured: false
      },
      {
        name: "D&D Dice Tower",
        slug: "dnd-dice-tower",
        description: "Fantasy themed dice tower for tabletop gaming.",
        price: "19.99",
        imageUrl: "https://images.unsplash.com/photo-1518736133836-9b4a31ef7ae7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        images: ["https://images.unsplash.com/photo-1518736133836-9b4a31ef7ae7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
        categoryId: 5,
        material: "PLA",
        inStock: true,
        featured: false
      }
    ];
    
    productsData.forEach(product => this.createProduct(product));
    
    // Update product ratings
    this.updateProduct(1, { rating: "4.7", reviewCount: 42 });
    this.updateProduct(2, { rating: "5.0", reviewCount: 87 });
    this.updateProduct(3, { rating: "4.0", reviewCount: 31 });
    this.updateProduct(4, { rating: "4.5", reviewCount: 19 });
  }

  private updateProduct(id: number, updates: Partial<Product>): void {
    const product = this.products.get(id);
    if (product) {
      this.products.set(id, { ...product, ...updates });
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id,
      rating: "0",
      reviewCount: 0,
      createdAt: now
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Cart
  async getCartItems(userId?: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => userId ? item.userId === userId : true,
    );
  }
  
  async getCartItemWithProduct(cartItemId: number): Promise<(CartItem & { product: Product }) | undefined> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) return undefined;
    
    const product = this.products.get(cartItem.productId);
    if (!product) return undefined;
    
    return { ...cartItem, product };
  }
  
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if product already in cart
    const existingItems = Array.from(this.cartItems.values()).filter(
      (cartItem) => cartItem.productId === item.productId && cartItem.userId === item.userId,
    );
    
    if (existingItems.length > 0) {
      const existingItem = existingItems[0];
      return this.updateCartItem(existingItem.id, existingItem.quantity + item.quantity) as Promise<CartItem>;
    }
    
    // Add new item
    const id = this.cartItemIdCounter++;
    const now = new Date();
    const newCartItem: CartItem = { ...item, id, addedAt: now };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId?: number): Promise<boolean> {
    if (userId) {
      // Delete only items for this user
      Array.from(this.cartItems.entries()).forEach(([id, item]) => {
        if (item.userId === userId) {
          this.cartItems.delete(id);
        }
      });
    } else {
      // Clear all cart items
      this.cartItems.clear();
    }
    return true;
  }
  
  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = { ...order, id, createdAt: now };
    this.orders.set(id, newOrder);
    
    // Add order items
    items.forEach(item => {
      const itemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = { ...item, id, orderId: id };
      this.orderItems.set(itemId, orderItem);
    });
    
    return newOrder;
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product not found for order item: ${item.id}`);
        return { ...item, product };
      });
    
    return { ...order, items };
  }
  
  async getUserOrders(userId?: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => userId ? order.userId === userId : true)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  // Custom Prints
  async calculatePrintCost(printDetails: Partial<InsertCustomPrint>): Promise<CustomPrint> {
    // This is a simplified calculation model
    // In real world, this would use more advanced algorithms
    const materialCostPerGram = this.getMaterialCostPerGram(printDetails.material || 'PLA');
    const laborCostPerMinute = 0.1; // $0.1 per minute of printing
    const setupFee = 5.0; // Base setup fee
    
    let volume = parseFloat(String(printDetails.volume || 0));
    if (volume <= 0) {
      // If volume not provided, estimate based on file size
      volume = (printDetails.fileSize || 0) / 10000; // Rough estimate
    }
    
    // Calculate weight based on volume and material density
    const density = this.getMaterialDensity(printDetails.material || 'PLA');
    const weight = volume * density;
    
    // Estimate print time based on volume, quality, and infill
    const qualityFactor = this.getQualityFactor(printDetails.quality || 'standard');
    const infillFactor = (printDetails.infill || 20) / 100;
    const printTime = Math.round(volume * qualityFactor * (0.5 + infillFactor * 0.5));
    
    // Calculate costs
    const materialCost = parseFloat((weight * materialCostPerGram).toFixed(2));
    const printTimeCost = parseFloat((printTime * laborCostPerMinute).toFixed(2));
    
    // Determine complexity
    const complexity = this.determineComplexity(volume, printDetails.stlMetadata);
    
    // Adjust setup fee based on complexity
    const adjustedSetupFee = this.adjustSetupFee(setupFee, complexity);
    
    const totalCost = parseFloat((materialCost + printTimeCost + adjustedSetupFee).toFixed(2));
    
    const id = this.customPrintIdCounter; // Not incrementing yet, just for preview
    const now = new Date();
    
    return {
      id,
      userId: printDetails.userId,
      fileName: printDetails.fileName || 'unknown.stl',
      fileSize: printDetails.fileSize || 0,
      material: printDetails.material || 'PLA',
      quality: printDetails.quality || 'standard',
      infill: printDetails.infill || 20,
      volume: String(volume.toFixed(1)),
      weight: String(weight.toFixed(1)),
      printTime,
      complexity,
      materialCost: String(materialCost),
      printTimeCost: String(printTimeCost),
      setupFee: String(adjustedSetupFee),
      totalCost: String(totalCost),
      stlMetadata: printDetails.stlMetadata,
      status: 'preview',
      createdAt: now
    };
  }
  
  private getMaterialCostPerGram(material: string): number {
    // Material costs per gram
    const costs: Record<string, number> = {
      'PLA': 0.05,
      'ABS': 0.06,
      'PETG': 0.07,
      'TPU': 0.09
    };
    
    return costs[material] || 0.05;
  }
  
  private getMaterialDensity(material: string): number {
    // Material density in g/cm³
    const densities: Record<string, number> = {
      'PLA': 1.24,
      'ABS': 1.04,
      'PETG': 1.27,
      'TPU': 1.21
    };
    
    return densities[material] || 1.24;
  }
  
  private getQualityFactor(quality: string): number {
    // Quality factor affects print time
    const factors: Record<string, number> = {
      'draft': 0.7,    // Faster printing (0.3mm layers)
      'standard': 1.0, // Standard printing (0.2mm layers)
      'fine': 1.8      // Slow printing (0.1mm layers)
    };
    
    return factors[quality] || 1.0;
  }
  
  private determineComplexity(volume: number, metadata?: any): string {
    // In a real app, this would analyze the STL file geometry
    // Here we just make an educated guess based on volume
    
    if (volume > 200) return 'high';
    if (volume > 50) return 'medium';
    return 'low';
  }
  
  private adjustSetupFee(baseFee: number, complexity: string): number {
    // Adjust setup fee based on complexity
    const factors: Record<string, number> = {
      'low': 1.0,
      'medium': 1.5,
      'high': 2.0
    };
    
    return parseFloat((baseFee * (factors[complexity] || 1.0)).toFixed(2));
  }
  
  async saveCustomPrint(customPrint: InsertCustomPrint): Promise<CustomPrint> {
    const id = this.customPrintIdCounter++;
    const now = new Date();
    const newCustomPrint: CustomPrint = { ...customPrint, id, createdAt: now, status: 'pending' };
    this.customPrints.set(id, newCustomPrint);
    return newCustomPrint;
  }
  
  async getCustomPrints(userId?: number): Promise<CustomPrint[]> {
    return Array.from(this.customPrints.values())
      .filter(print => userId ? print.userId === userId : true)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  // Contact
  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const now = new Date();
    const newMessage: ContactMessage = { ...message, id, createdAt: now, responded: false };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Lithophane Prints
  async calculateLithophaneCost(lithophaneDetails: Partial<InsertLithophane>): Promise<Lithophane> {
    // Simplified calculation model for lithophanes
    const materialCostPerGram = this.getMaterialCostPerGram(lithophaneDetails.material || 'PLA');
    const laborCostPerMinute = 0.12; // $0.12 per minute - slightly higher than normal prints
    const setupFee = 6.0; // Base setup fee for lithophanes
    
    // Calculate volume based on dimensions and thickness
    const width = parseFloat(String(lithophaneDetails.width || 100)); // mm
    const height = parseFloat(String(lithophaneDetails.height || 100)); // mm
    const thickness = parseFloat(String(lithophaneDetails.thickness || 3)); // mm
    const baseThickness = parseFloat(String(lithophaneDetails.baseThickness || 1)); // mm
    
    // Calculate average volume (lithophanes vary in thickness based on image)
    const avgThickness = (thickness + baseThickness) / 2;
    const volume = (width * height * avgThickness) / 1000; // convert to cm³
    
    // Calculate weight based on volume and material density
    const density = this.getMaterialDensity(lithophaneDetails.material || 'PLA');
    const weight = volume * density;
    
    // Estimate print time (lithophanes are printed slowly for detail)
    const qualityFactor = this.getQualityFactor(lithophaneDetails.quality || 'fine'); // Usually fine quality
    const infillFactor = (lithophaneDetails.infill || 15) / 100;
    // Lithophanes take longer due to detail work
    const printTime = Math.round(volume * qualityFactor * (0.7 + infillFactor * 0.5) * 1.2);
    
    // Add time for border if needed
    const hasBorder = lithophaneDetails.border !== false;
    const borderTime = hasBorder ? 
      Math.round((width + height) * 0.2) : 0; // Simplified border time calculation
    
    const totalPrintTime = printTime + borderTime;
    
    // Calculate costs
    const materialCost = parseFloat((weight * materialCostPerGram).toFixed(2));
    const printTimeCost = parseFloat((totalPrintTime * laborCostPerMinute).toFixed(2));
    
    // Additional processing fee for photo conversion
    const processingFee = 3.0;
    const totalCost = parseFloat((materialCost + printTimeCost + setupFee + processingFee).toFixed(2));
    
    const id = this.lithophaneIdCounter; // Not incrementing yet, just for preview
    const now = new Date();
    
    return {
      id,
      userId: lithophaneDetails.userId,
      imageName: lithophaneDetails.imageName || 'unknown.jpg',
      imageSize: lithophaneDetails.imageSize || 0,
      imageFormat: lithophaneDetails.imageFormat || 'jpg',
      width: String(width),
      height: String(height),
      thickness: String(thickness),
      baseThickness: String(baseThickness),
      material: lithophaneDetails.material || 'PLA',
      quality: lithophaneDetails.quality || 'fine',
      infill: lithophaneDetails.infill || 15,
      border: hasBorder,
      borderWidth: hasBorder ? String(lithophaneDetails.borderWidth || 5) : null,
      borderHeight: hasBorder ? String(lithophaneDetails.borderHeight || 5) : null,
      invertImage: lithophaneDetails.invertImage || false,
      negative: lithophaneDetails.negative || false,
      printTime: totalPrintTime,
      materialCost: String(materialCost),
      printTimeCost: String(printTimeCost),
      setupFee: String(setupFee),
      totalCost: String(totalCost),
      status: 'preview',
      imagePreview: lithophaneDetails.imagePreview || null,
      createdAt: now
    };
  }
  
  async saveLithophane(lithophane: InsertLithophane): Promise<Lithophane> {
    const id = this.lithophaneIdCounter++;
    const now = new Date();
    const newLithophane: Lithophane = { 
      ...lithophane, 
      id, 
      createdAt: now, 
      status: 'pending'
    };
    this.lithophanes.set(id, newLithophane);
    return newLithophane;
  }
  
  async getLithophanes(userId?: number): Promise<Lithophane[]> {
    return Array.from(this.lithophanes.values())
      .filter(lithophane => userId ? lithophane.userId === userId : true)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async getLithophaneById(id: number): Promise<Lithophane | undefined> {
    return this.lithophanes.get(id);
  }
}

export const storage = new MemStorage();
