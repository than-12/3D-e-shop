import { eq, and, or, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  customPrints,
  contactMessages,
  lithophanes,
  type User,
  type Category,
  type Product,
  type CartItem,
  type Order,
  type OrderItem,
  type CustomPrint,
  type ContactMessage,
  type Lithophane,
} from "@shared/schema";

export class DrizzleStorage {
  // User methods
  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)));
    return result[0] || null;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    const result = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category | null> {
    const result = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.slug, slug));
    return result[0] || null;
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const result = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  // Cart methods
  async getCartItems(userId: number): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: Omit<CartItem, "id">): Promise<CartItem> {
    const result = await db.insert(cartItems).values(cartItem).returning();
    return result[0];
  }

  async updateCartItem(id: number, cartItem: Partial<CartItem>): Promise<CartItem | null> {
    const result = await db
      .update(cartItems)
      .set(cartItem)
      .where(eq(cartItems.id, id))
      .returning();
    return result[0] || null;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }

  // Order methods
  async createOrder(order: Omit<Order, "id">): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async getOrder(id: number): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0] || null;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const result = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0] || null;
  }

  // Custom print methods
  async calculatePrintCost(params: {
    volume: number;
    material: string;
    quality: string;
    infill: number;
  }): Promise<number> {
    // Υλοποίηση του υπολογισμού κόστους εκτύπωσης
    const materialCost = params.volume * 0.05; // Υπολογισμός κόστους υλικού
    const printTimeCost = params.volume * 0.02; // Υπολογισμός κόστους χρόνου εκτύπωσης
    const setupFee = 5; // Χρέωση ρύθμισης

    return materialCost + printTimeCost + setupFee;
  }

  async saveCustomPrint(customPrint: Omit<CustomPrint, "id">): Promise<CustomPrint> {
    const result = await db.insert(customPrints).values(customPrint).returning();
    return result[0];
  }

  async getCustomPrint(id: number): Promise<CustomPrint | null> {
    const result = await db.select().from(customPrints).where(eq(customPrints.id, id));
    return result[0] || null;
  }

  async getUserCustomPrints(userId: number): Promise<CustomPrint[]> {
    return db.select().from(customPrints).where(eq(customPrints.userId, userId));
  }

  // Lithophane methods
  async calculateLithophaneCost(params: {
    width: number;
    height: number;
    thickness: number;
    material: string;
    quality: string;
    infill: number;
  }): Promise<number> {
    // Υλοποίηση του υπολογισμού κόστους λιθοφάνειας
    const volume = params.width * params.height * params.thickness;
    const materialCost = volume * 0.05; // Υπολογισμός κόστους υλικού
    const printTimeCost = volume * 0.02; // Υπολογισμός κόστους χρόνου εκτύπωσης
    const setupFee = 5; // Χρέωση ρύθμισης

    return materialCost + printTimeCost + setupFee;
  }

  async saveLithophane(lithophane: Omit<Lithophane, "id">): Promise<Lithophane> {
    const result = await db.insert(lithophanes).values(lithophane).returning();
    return result[0];
  }

  async getLithophane(id: number): Promise<Lithophane | null> {
    const result = await db.select().from(lithophanes).where(eq(lithophanes.id, id));
    return result[0] || null;
  }

  async getUserLithophanes(userId: number): Promise<Lithophane[]> {
    return db.select().from(lithophanes).where(eq(lithophanes.userId, userId));
  }

  // Contact message methods
  async saveContactMessage(message: Omit<ContactMessage, "id">): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages);
  }

  async updateContactMessageStatus(id: number, responded: boolean): Promise<ContactMessage | null> {
    const result = await db
      .update(contactMessages)
      .set({ responded })
      .where(eq(contactMessages.id, id))
      .returning();
    return result[0] || null;
  }
} 