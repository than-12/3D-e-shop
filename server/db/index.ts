import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'path';
import * as schema from './schema';

// Δημιουργία σύνδεσης με τη βάση δεδομένων
const client = createClient({
  url: 'file:' + path.resolve(__dirname, '../../db.sqlite'),
});

export const db = drizzle(client, { schema });

// Εξαγωγή των τύπων για τις παραμέτρους του Drizzle
export * from './schema';

// Συνάρτηση για εκτέλεση μετεγκαταστάσεων
export async function runMigrations() {
  await migrate(db, { migrationsFolder: path.resolve(__dirname, './migrations') });
  console.log('Migrations have been applied');
}

// Συνάρτηση για δημιουργία πινάκων
export async function createTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      categoryId INTEGER NOT NULL,
      imageUrl TEXT,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      status TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      isRead BOOLEAN NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `;

  try {
    await client.execute(sql);
    console.log('Tables have been created');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
} 