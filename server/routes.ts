import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertCartItemSchema,
  insertContactMessageSchema,
  insertCustomPrintSchema,
  insertLithophaneSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertUserSchema
} from "@shared/schema";

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
      const categorySlug = req.query.category as string | undefined;
      const featured = req.query.featured === 'true';
      
      let products;
      if (categorySlug) {
        const category = await storage.getCategoryBySlug(categorySlug);
        if (category) {
          products = await storage.getProductsByCategory(category.id);
        } else {
          return res.status(404).json({ message: 'Category not found' });
        }
      } else if (featured) {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch products: ${error}` });
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
  // Get cart items
  app.get('/api/cart', async (req: Request, res: Response) => {
    try {
      const cartItems = await storage.getCartItems();
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const itemWithProduct = await storage.getCartItemWithProduct(item.id);
          return itemWithProduct;
        })
      );
      
      // Filter out any undefined items
      const validItems = itemsWithProducts.filter(Boolean);
      
      res.json(validItems);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch cart: ${error}` });
    }
  });

  // Add to cart
  app.post('/api/cart', async (req: Request, res: Response) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid cart item data', errors: error.errors });
      } else {
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
      
      const updatedItem = await storage.updateCartItem(id, quantity);
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
      
      const success = await storage.removeCartItem(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Cart item not found' });
      }
    } catch (error) {
      res.status(500).json({ message: `Failed to remove cart item: ${error}` });
    }
  });

  // Clear cart
  app.delete('/api/cart', async (_req: Request, res: Response) => {
    try {
      await storage.clearCart();
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
      
      const newOrder = await storage.createOrder(validatedOrder, validatedItems);
      
      // Clear cart after successful order
      await storage.clearCart();
      
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
  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getUserOrders();
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
      
      const order = await storage.getOrderById(id);
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
  app.post('/api/custom-prints', async (req: Request, res: Response) => {
    try {
      const printData = insertCustomPrintSchema.parse(req.body);
      const customPrint = await storage.saveCustomPrint(printData);
      res.status(201).json(customPrint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid custom print data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to save custom print: ${error}` });
      }
    }
  });

  // Get all custom prints
  app.get('/api/custom-prints', async (_req: Request, res: Response) => {
    try {
      const prints = await storage.getCustomPrints();
      res.json(prints);
    } catch (error) {
      res.status(500).json({ message: `Failed to fetch custom prints: ${error}` });
    }
  });

  // Contact form
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.saveContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid contact message data', errors: error.errors });
      } else {
        res.status(500).json({ message: `Failed to save contact message: ${error}` });
      }
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
