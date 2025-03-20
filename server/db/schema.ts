import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// Πίνακας χρηστών
export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('USER'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Πίνακας κατηγοριών
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull().unique(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Πίνακας προϊόντων
export const products = sqliteTable('products', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull().unique(),
  description: text('description'),
  price: real('price').notNull(),
  slug: text('slug').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  stock: integer('stock').default(0),
  dimensions: text('dimensions'),
  weight: real('weight'),
  material: text('material'),
  color: text('color'),
  printTime: text('print_time'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Πίνακας παραγγελιών
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('PENDING'),
  totalAmount: real('total_amount').notNull(),
  shippingDetails: text('shipping_details', { mode: 'json' }),
  paymentStatus: text('payment_status').default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Πίνακας στοιχείων παραγγελίας
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().notNull(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Πίνακας μηνυμάτων
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  status: text('status').default('PENDING'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`)
});

// Σχέσεις
export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  orderItems: many(orderItems)
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  items: many(orderItems)
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
})); 