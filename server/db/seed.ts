import { db } from './index';
import { users, categories, products, orders, orderItems, messages } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { createClient } from '@libsql/client';
import path from 'path';

// Δημιουργία σύνδεσης με τη βάση δεδομένων
const client = createClient({
  url: 'file:' + path.resolve(__dirname, '../../db.sqlite'),
});

async function seed() {
  try {
    // Καθαρισμός των πινάκων
    await client.execute('DELETE FROM messages');
    await client.execute('DELETE FROM order_items');
    await client.execute('DELETE FROM orders');
    await client.execute('DELETE FROM products');
    await client.execute('DELETE FROM categories');
    await client.execute('DELETE FROM users');

    // Δημιουργία χρηστών
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminResult = await client.execute({
      sql: `INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['admin@example.com', hashedPassword, 'Admin User', 'admin']
    });
    const adminUser = adminResult.rows[0];

    const customerResult = await client.execute({
      sql: `INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['customer@example.com', hashedPassword, 'Customer User', 'customer']
    });
    const customerUser = customerResult.rows[0];

    // Δημιουργία κατηγοριών
    const customCategoryResult = await client.execute({
      sql: `INSERT INTO categories (name, description, createdAt, updatedAt) 
            VALUES (?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['Custom Prints', 'Custom 3D printing services']
    });
    const customCategory = customCategoryResult.rows[0];

    const lithophaneCategoryResult = await client.execute({
      sql: `INSERT INTO categories (name, description, createdAt, updatedAt) 
            VALUES (?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['Lithophanes', 'Beautiful lithophane prints']
    });
    const lithophaneCategory = lithophaneCategoryResult.rows[0];

    // Δημιουργία προϊόντων
    const customProductResult = await client.execute({
      sql: `INSERT INTO products (name, description, price, categoryId, imageUrl, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['Custom 3D Print', 'Custom 3D printing service', 20, customCategory.id, '/images/productImage.jpg']
    });
    const customProduct = customProductResult.rows[0];

    const lithophaneProductResult = await client.execute({
      sql: `INSERT INTO products (name, description, price, categoryId, imageUrl, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: ['Lithophane Print', 'Beautiful lithophane print', 30, lithophaneCategory.id, '/images/productImage.jpg']
    });
    const lithophaneProduct = lithophaneProductResult.rows[0];

    // Δημιουργία παραγγελιών
    const orderResult = await client.execute({
      sql: `INSERT INTO orders (userId, status, totalAmount, createdAt, updatedAt) 
            VALUES (?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now')) 
            RETURNING *`,
      args: [customerUser.id, 'pending', 50]
    });
    const order = orderResult.rows[0];

    // Δημιουργία στοιχείων παραγγελίας
    await client.execute({
      sql: `INSERT INTO order_items (orderId, productId, quantity, price, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      args: [order.id, customProduct.id, 1, customProduct.price]
    });

    await client.execute({
      sql: `INSERT INTO order_items (orderId, productId, quantity, price, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      args: [order.id, lithophaneProduct.id, 1, lithophaneProduct.price]
    });

    // Δημιουργία μηνυμάτων
    await client.execute({
      sql: `INSERT INTO messages (userId, content, isRead, createdAt, updatedAt) 
            VALUES (?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      args: [customerUser.id, 'Hello, I have a question about custom prints.', 0]
    });

    await client.execute({
      sql: `INSERT INTO messages (userId, content, isRead, createdAt, updatedAt) 
            VALUES (?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
      args: [adminUser.id, 'Sure, how can I help you?', 1]
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Εκτέλεση της σποράς
seed(); 