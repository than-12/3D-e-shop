import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User accounts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
});

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  icon: text("icon"),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  images: text("images").array(),
  categoryId: integer("category_id"),
  material: text("material"),
  inStock: boolean("in_stock").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Custom print orders from STL files
export const customPrints = pgTable("custom_prints", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  material: text("material").notNull(), // PLA, ABS, etc
  quality: text("quality").notNull(), // draft, standard, fine
  infill: integer("infill").notNull(), // percentage
  volume: decimal("volume", { precision: 10, scale: 2 }), // in cm³
  weight: decimal("weight", { precision: 10, scale: 2 }), // in grams
  printTime: integer("print_time"), // in minutes
  complexity: text("complexity"), // low, medium, high
  materialCost: decimal("material_cost", { precision: 10, scale: 2 }),
  printTimeCost: decimal("print_time_cost", { precision: 10, scale: 2 }),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  stlMetadata: json("stl_metadata"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  responded: boolean("responded").default(false),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  phone: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  icon: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  imageUrl: true,
  images: true,
  categoryId: true,
  material: true,
  inStock: true,
  featured: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  shippingAddress: true,
  contactEmail: true,
  contactPhone: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

export const insertCustomPrintSchema = createInsertSchema(customPrints).pick({
  userId: true,
  fileName: true,
  fileSize: true,
  material: true,
  quality: true,
  infill: true,
  volume: true,
  weight: true,
  printTime: true,
  complexity: true,
  materialCost: true,
  printTimeCost: true,
  setupFee: true,
  totalCost: true,
  stlMetadata: true,
  status: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertCustomPrint = z.infer<typeof insertCustomPrintSchema>;
export type CustomPrint = typeof customPrints.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
