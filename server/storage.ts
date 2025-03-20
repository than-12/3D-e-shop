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
} from "./db/schema";
import { eq, and } from "drizzle-orm";
import { db } from './db';

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

  // Διαχείριση χρηστών
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null>;
  createUser(userData: InsertUser): Promise<User | null>;

  // Διαχείριση παραγγελιών χρήστη
  getOrdersByUserId(userId: number): Promise<Order[]>;
}

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : null;
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : null;
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, usernameOrEmail),
          eq(users.email, usernameOrEmail)
        )
      );
    return result.length > 0 ? result[0] : null;
  }
  
  async createUser(userData: InsertUser): Promise<User | null> {
    const result = await db.insert(users).values(userData).returning();
    return result.length > 0 ? result[0] : null;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Products
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.featured, true));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  
  // Cart
  async getCartItems(userId?: number): Promise<CartItem[]> {
    if (userId) {
      return db.select()
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, userId));
    } else {
      return db.select()
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id));
    }
  }
  
  async getCartItemWithProduct(cartItemId: number): Promise<(CartItem & { product: Product }) | undefined> {
    const result = await db.select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.id, cartItemId));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].cartItems,
      product: result[0].products
    };
  }
  
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(item).returning();
    const cartItem = result[0];
    
    const productResult = await db.select()
      .from(products)
      .where(eq(products.id, cartItem.productId));
    
    return {
      ...cartItem,
      product: productResult[0]
    };
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    if (result.length === 0) return undefined;
    
    const cartItem = result[0];
    const productResult = await db.select()
      .from(products)
      .where(eq(products.id, cartItem.productId));
    
    return {
      ...cartItem,
      product: productResult[0]
    };
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    try {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return true;
    } catch {
      return false;
    }
  }
  
  async clearCart(userId?: number): Promise<boolean> {
    try {
      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else {
        await db.delete(cartItems);
      }
      return true;
    } catch {
      return false;
    }
  }
  
  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderResult = await db.insert(orders).values(order).returning();
    const createdOrder = orderResult[0];
    
    await Promise.all(
      items.map(item => 
        db.insert(orderItems).values({
          ...item,
          orderId: createdOrder.id
        })
      )
    );
    
    return this.getOrderById(createdOrder.id);
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id));
    if (orderResult.length === 0) return undefined;
    
    const order = orderResult[0];
    
    const itemsResult = await db.select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));
    
    const items = itemsResult.map(row => ({
      ...row.orderItems,
      product: row.products
    }));
    
    return {
      ...order,
      items
    };
  }
  
  async getUserOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId));
    } else {
      return db.select().from(orders);
    }
  }
  
  // Custom Prints
  async calculatePrintCost(printDetails: Partial<InsertCustomPrint>): Promise<CustomPrint> {
    // Υπολογισμός κόστους εκτύπωσης με βάση τις διαστάσεις και άλλες παραμέτρους
    const baseCost = 10; // Βασικό κόστος
    const dimensionCost = (printDetails.width || 0) * (printDetails.height || 0) * (printDetails.depth || 0) * 0.01;
    const materialMultiplier = printDetails.material === 'PLA' ? 1 : 
                                printDetails.material === 'ABS' ? 1.2 : 
                                printDetails.material === 'PETG' ? 1.3 : 1;
    const colorMultiplier = printDetails.color === 'standard' ? 1 : 1.2;
    const qualityMultiplier = printDetails.quality === 'standard' ? 1 : 
                               printDetails.quality === 'high' ? 1.3 : 1.5;
    
    const totalCost = (baseCost + dimensionCost) * materialMultiplier * colorMultiplier * qualityMultiplier;
    
    return {
      id: 0, // Temporary ID
      userId: printDetails.userId || 0,
      width: printDetails.width || 0,
      height: printDetails.height || 0,
      depth: printDetails.depth || 0,
      material: printDetails.material || 'PLA',
      color: printDetails.color || 'standard',
      quality: printDetails.quality || 'standard',
      quantity: printDetails.quantity || 1,
      notes: printDetails.notes || '',
      price: Math.round(totalCost * 100) / 100,
      status: 'calculated',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  
  async saveCustomPrint(customPrint: InsertCustomPrint): Promise<CustomPrint> {
    const result = await db.insert(customPrints).values(customPrint).returning();
    return result[0];
  }
  
  async getCustomPrints(userId?: number): Promise<CustomPrint[]> {
    if (userId) {
      return db.select().from(customPrints).where(eq(customPrints.userId, userId));
    } else {
      return db.select().from(customPrints);
    }
  }
  
  // Contact
  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }
  
  // Lithophane Prints
  async calculateLithophaneCost(lithophaneDetails: Partial<InsertLithophane>): Promise<Lithophane> {
    // Υπολογισμός κόστους λιθοφάνειας
    const baseCost = 15; // Βασικό κόστος λιθοφάνειας
    const sizeCost = (lithophaneDetails.width || 0) * (lithophaneDetails.height || 0) * 0.02;
    const thicknessMultiplier = lithophaneDetails.thickness === 'thin' ? 1 : 
                                lithophaneDetails.thickness === 'medium' ? 1.2 : 1.4;
    const frameMultiplier = lithophaneDetails.hasFrame ? 1.3 : 1;
    const standMultiplier = lithophaneDetails.hasStand ? 1.2 : 1;
    const lightingMultiplier = lithophaneDetails.hasLighting ? 1.5 : 1;
    
    const totalCost = (baseCost + sizeCost) * thicknessMultiplier * frameMultiplier * standMultiplier * lightingMultiplier;
    
    return {
      id: 0, // Temporary ID
      userId: lithophaneDetails.userId || 0,
      imageUrl: lithophaneDetails.imageUrl || '',
      width: lithophaneDetails.width || 0,
      height: lithophaneDetails.height || 0,
      thickness: lithophaneDetails.thickness || 'medium',
      hasFrame: lithophaneDetails.hasFrame || false,
      hasStand: lithophaneDetails.hasStand || false,
      hasLighting: lithophaneDetails.hasLighting || false,
      quantity: lithophaneDetails.quantity || 1,
      notes: lithophaneDetails.notes || '',
      price: Math.round(totalCost * 100) / 100,
      status: 'calculated',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  
  async saveLithophane(lithophane: InsertLithophane): Promise<Lithophane> {
    const result = await db.insert(lithophanes).values(lithophane).returning();
    return result[0];
  }
  
  async getLithophanes(userId?: number): Promise<Lithophane[]> {
    if (userId) {
      return db.select().from(lithophanes).where(eq(lithophanes.userId, userId));
    } else {
      return db.select().from(lithophanes);
    }
  }
  
  async getLithophaneById(id: number): Promise<Lithophane | undefined> {
    const result = await db.select().from(lithophanes).where(eq(lithophanes.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }
}

export const storage = new DrizzleStorage();
