import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  insertCartItemSchema,
  insertContactMessageSchema,
  insertCustomPrintSchema,
  insertLithophaneSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertUserSchema,
  insertProductSchema,
  type CustomPrint,
  type Lithophane
} from "./db/schema";
import bcrypt from 'bcrypt';
import { Router } from "express";
import { DrizzleStorage } from "./storage";
import { Session } from 'express-session';

declare module 'express' {
  interface Request {
    session?: {
      userId?: number;
    };
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

interface RequestWithSession extends Request {
  session: Session & {
    userId?: number;
  };
}

const router = Router();
const storage = new DrizzleStorage();

declare module 'bcrypt' {
  export function compare(password: string, hash: string): Promise<boolean>;
  export function hash(password: string, salt: number): Promise<string>;
  export function genSalt(rounds: number): Promise<string>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route('/api');

  // Get all categories
  app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch categories: ${error}` });
    }
  });

  // Get products
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      // Προσωρινά δοκιμαστικά δεδομένα για το endpoint products
      const products = [
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
        }
      ];
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch products: ${error}` });
    }
  });

  // Create product
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...productData,
        description: productData.description || null,
        imageUrl: productData.imageUrl || null,
        images: productData.images || null,
        categoryId: productData.categoryId || null,
        material: productData.material || null,
        inStock: productData.inStock || true,
        featured: productData.featured || false,
        rating: "0",
        reviewCount: 0,
        createdAt: new Date()
      });
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to create product: ${error}` });
      }
    }
  });

  // Get single product by slug
  app.get('/api/products/:slug', async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch product: ${error}` });
    }
  });

  // Cart endpoints
  // Get cart
  app.get('/api/cart', async (_req: Request, res: Response) => {
    try {
      // Προσωρινά δοκιμαστικά δεδομένα για το cart
      const cart = {
        items: [],
        total: "0.00"
      };
      
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch cart: ${error}` });
    }
  });

  // Add to cart
  app.post('/api/cart', async (req: RequestWithSession, res: Response) => {
    try {
      console.log("Received cart item data:", req.body);
      
      if (req.body.customPrintId && req.body.customPrintId > 0) {
        console.log("Processing custom print for cart:", req.body.customPrintId);
        
        const cartItem = await storage.addToCart({
          customPrintId: req.body.customPrintId,
          quantity: req.body.quantity || 1,
          userId: req.session?.userId || null,
          productId: null,
          photoUrl: null,
          addedAt: new Date()
        });
        
        console.log("Custom print added to cart:", cartItem);
        return res.status(201).json(cartItem);
      }
      
      const cartItemData = insertCartItemSchema.safeParse(req.body);
      
      if (!cartItemData.success) {
        console.error("Validation errors:", cartItemData.error);
        return res.status(400).json({ 
          message: 'Invalid cart item data', 
          errors: cartItemData.error.issues,
          details: 'Validation failed with schema',
          debug: {
            productId: req.body.productId,
            customPrintId: req.body.customPrintId,
            typeofProductId: typeof req.body.productId,
            typeofCustomPrintId: typeof req.body.customPrintId
          }
        });
      }
      
      console.log("Parsed cart item data:", cartItemData.data);
      const cartItem = await storage.addToCart({
        ...cartItemData.data,
        userId: req.session?.userId || null,
        productId: cartItemData.data.productId || null,
        customPrintId: cartItemData.data.customPrintId || null,
        photoUrl: null,
        addedAt: new Date()
      });
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        res.status(400).json({ message: 'Invalid cart item data', errors: error.errors });
      } else {
        console.error("Server error adding to cart:", error);
        res.status(500).json({ message: `Failed to add to cart: ${error}` });
      }
    }
  });

  // Update cart item
  app.patch('/api/cart/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (isNaN(id) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Invalid cart item update' });
      }
      
      const updatedItem = await storage.updateCartItem(id, { quantity });
      if (updatedItem) {
        res.json(updatedItem);
      } else {
        res.status(404).json({ message: 'Cart item not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to update cart item: ${error}` });
    }
  });

  // Remove from cart
  app.delete('/api/cart/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid cart item ID' });
      }
      
      await storage.removeCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to remove cart item: ${error}` });
    }
  });

  // Clear cart
  app.delete('/api/cart', async (req: RequestWithSession, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      await storage.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: `Failed to clear cart: ${error}` });
    }
  });

  // Orders endpoints
  // Create order
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const validatedOrder = insertOrderSchema.parse(order);
      const validatedItems = items.map((item: any) => insertOrderItemSchema.parse(item));
      
      const orderData = {
        ...validatedOrder,
        createdAt: new Date(),
        userId: validatedOrder.userId || null,
        status: validatedOrder.status || 'pending'
      };
      
      const newOrder = await storage.createOrder(orderData);
      
      // Clear cart after successful order
      if (orderData.userId) {
        await storage.clearCart(orderData.userId);
      }
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid order data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to create order: ${error}` });
      }
    }
  });

  // Get all orders
  app.get('/api/orders', async (req: RequestWithSession, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch orders: ${error}` });
    }
  });

  // Get order by ID
  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(id);
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch order: ${error}` });
    }
  });

  // Custom prints endpoints
  // Calculate print cost
  app.post('/api/custom-prints/calculate', async (req: Request, res: Response) => {
    try {
      // We don't fully validate here as we're just estimating
      const printDetails = req.body;
      const costEstimate = await storage.calculatePrintCost(printDetails);
      res.json(costEstimate);
    } catch (error) {
      res.status(500).json({ message: `Failed to calculate print cost: ${error}` });
    }
  });

  // Save custom print
  app.post('/api/custom-prints', async (req: RequestWithSession, res: Response) => {
    try {
      const { material, dimensions } = req.body;
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const customPrint = await storage.saveCustomPrint({
        userId,
        fileName: 'file.stl',
        fileSize: 0,
        material,
        quality: 'standard',
        infill: 20,
        volume: null,
        weight: null,
        printTime: null,
        complexity: null,
        materialCost: null,
        printTimeCost: null,
        setupFee: null,
        totalCost: null,
        stlMetadata: null,
        status: 'pending',
        createdAt: new Date()
      });
      
      res.status(201).json({ success: true, customPrint });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Σφάλμα κατά τη δημιουργία της εκτύπωσης' });
    }
  });

  // Get all custom prints
  app.get('/api/custom-prints', async (req: RequestWithSession, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const prints = await storage.getUserCustomPrints(userId);
      res.json(prints);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch custom prints: ${error}` });
    }
  });

  // Contact form
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.saveContactMessage({
        ...messageData,
        createdAt: new Date(),
        responded: false,
        subject: messageData.subject || null
      });
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid contact message data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to save contact message: ${error}` });
      }
    }
  });
  
  // Lithophane endpoints
  // Calculate lithophane cost
  app.post('/api/lithophanes/calculate', async (req: Request, res: Response) => {
    try {
      // We don't fully validate here as we're just estimating
      const lithophaneDetails = req.body;
      const costEstimate = await storage.calculateLithophaneCost(lithophaneDetails);
      res.json(costEstimate);
    } catch (error) {
      res.status(500).json({ message: `Failed to calculate lithophane cost: ${error}` });
    }
  });
  
  // Save lithophane order
  app.post('/api/lithophanes', async (req: RequestWithSession, res: Response) => {
    try {
      const { material } = req.body;
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const lithophane = await storage.saveLithophane({
        userId,
        imageName: 'image.jpg',
        imageSize: 0,
        imageFormat: 'jpg',
        thickness: "3",
        width: "100",
        height: "100",
        baseThickness: "2",
        material,
        quality: 'standard',
        infill: 20,
        border: true,
        borderWidth: null,
        borderHeight: null,
        invertImage: false,
        negative: false,
        printTime: null,
        materialCost: null,
        printTimeCost: null,
        setupFee: null,
        totalCost: null,
        status: 'pending',
        imagePreview: null,
        createdAt: new Date()
      });
      res.status(201).json(lithophane);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid lithophane data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to save lithophane: ${error}` });
      }
    }
  });
  
  // Get all lithophanes
  app.get('/api/lithophanes', async (req: RequestWithSession, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const lithophanes = await storage.getUserLithophanes(userId);
      res.json(lithophanes);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch lithophanes: ${error}` });
    }
  });
  
  // Get single lithophane by ID
  app.get('/api/lithophanes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid lithophane ID' });
      }
      
      const lithophane = await storage.getLithophane(id);
      if (lithophane) {
        res.json(lithophane);
      } else {
        res.status(404).json({ message: 'Lithophane not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch lithophane: ${error}` });
    }
  });

  // Get current user
  app.get('/api/me', async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch user: ${error}` });
    }
  });

  // Login
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { usernameOrEmail, password } = req.body;
      
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Username/email and password are required' });
      }
      
      // Βρίσκουμε τον χρήστη είτε με username είτε με email
      const user = await storage.getUserByUsernameOrEmail(usernameOrEmail);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Ελέγχουμε το password
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Αποθηκεύουμε το userId στο session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Επιστρέφουμε τα στοιχεία του χρήστη χωρίς το password
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: `Login failed: ${error}` });
    }
  });

  // Register
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to create user: ${error}` });
      }
    }
  });

  // Logout
  app.post('/api/logout', (req: Request, res: Response) => {
    if (req.session) {
      req.session.userId = undefined;
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      res.status(500).json({ message: 'Session management error' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
