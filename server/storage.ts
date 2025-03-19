import { PrismaClient } from '@prisma/client';
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
import { eq } from "drizzle-orm";

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

export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Users
  async getUser(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: id.toString() }
    });
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }
  
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      }
    });
  }
  
  async createUser(userData: InsertUser): Promise<User | null> {
    return this.prisma.user.create({
      data: userData
    });
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.prisma.category.findUnique({
      where: { slug }
    });
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    return this.prisma.category.create({
      data: category
    });
  }
  
  // Products
  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId: categoryId.toString() }
    });
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.prisma.product.findUnique({
      where: { slug }
    });
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { featured: true }
    });
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    return this.prisma.product.create({
      data: product
    });
  }
  
  // Cart
  async getCartItems(userId?: number): Promise<CartItem[]> {
    return this.prisma.cartItem.findMany({
      where: userId ? { userId: userId.toString() } : undefined,
      include: { product: true }
    });
  }
  
  async getCartItemWithProduct(cartItemId: number): Promise<(CartItem & { product: Product }) | undefined> {
    return this.prisma.cartItem.findUnique({
      where: { id: cartItemId.toString() },
      include: { product: true }
    });
  }
  
  async addToCart(item: InsertCartItem): Promise<CartItem> {
    return this.prisma.cartItem.create({
      data: item,
      include: { product: true }
    });
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    return this.prisma.cartItem.update({
      where: { id: id.toString() },
      data: { quantity },
      include: { product: true }
    });
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    try {
      await this.prisma.cartItem.delete({
        where: { id: id.toString() }
      });
      return true;
    } catch {
      return false;
    }
  }
  
  async clearCart(userId?: number): Promise<boolean> {
    try {
      await this.prisma.cartItem.deleteMany({
        where: userId ? { userId: userId.toString() } : undefined
      });
      return true;
    } catch {
      return false;
    }
  }
  
  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return this.prisma.order.create({
      data: {
        ...order,
        items: {
          create: items
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }
  
  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    return this.prisma.order.findUnique({
      where: { id: id.toString() },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }
  
  async getUserOrders(userId?: number): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: userId ? { userId: userId.toString() } : undefined,
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }
  
  // Custom Prints
  async calculatePrintCost(printDetails: Partial<InsertCustomPrint>): Promise<CustomPrint> {
    // Υλοποίηση του υπολογισμού κόστους
    return {
      id: 0,
      userId: printDetails.userId || null,
      name: printDetails.name || '',
      description: printDetails.description || '',
      fileUrl: printDetails.fileUrl || '',
      material: printDetails.material || 'PLA',
      quality: printDetails.quality || 'standard',
      volume: printDetails.volume || 0,
      cost: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async saveCustomPrint(customPrint: InsertCustomPrint): Promise<CustomPrint> {
    return this.prisma.customPrint.create({
      data: customPrint
    });
  }
  
  async getCustomPrints(userId?: number): Promise<CustomPrint[]> {
    return this.prisma.customPrint.findMany({
      where: userId ? { userId: userId.toString() } : undefined
    });
  }

  // Contact Messages
  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    return this.prisma.contactMessage.create({
      data: message
    });
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return this.prisma.contactMessage.findMany();
  }

  // Lithophanes
  async calculateLithophaneCost(lithophaneDetails: Partial<InsertLithophane>): Promise<Lithophane> {
    // Υλοποίηση του υπολογισμού κόστους
    return {
      id: 0,
      userId: lithophaneDetails.userId || null,
      name: lithophaneDetails.name || '',
      description: lithophaneDetails.description || '',
      imageUrl: lithophaneDetails.imageUrl || '',
      width: lithophaneDetails.width || 0,
      height: lithophaneDetails.height || 0,
      depth: lithophaneDetails.depth || 0,
      material: lithophaneDetails.material || 'PLA',
      quality: lithophaneDetails.quality || 'standard',
      cost: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async saveLithophane(lithophane: InsertLithophane): Promise<Lithophane> {
    return this.prisma.lithophane.create({
      data: lithophane
    });
  }
  
  async getLithophanes(userId?: number): Promise<Lithophane[]> {
    return this.prisma.lithophane.findMany({
      where: userId ? { userId: userId.toString() } : undefined
    });
  }
  
  async getLithophaneById(id: number): Promise<Lithophane | undefined> {
    return this.prisma.lithophane.findUnique({
      where: { id: id.toString() }
    });
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId: userId.toString() },
      include: {
        items: {
          include: { product: true }
        }
      }
    });
  }
}

export const storage = new PrismaStorage();
