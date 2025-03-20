import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Session } from 'express-session';

const router = express.Router();
const prisma = new PrismaClient();

interface CartItem {
  id: number;
  productId: string | number;
  quantity: number;
  customData?: any;
}

interface CustomSession extends Session {
  userId?: string;
  cart?: CartItem[];
}

// Σχήμα επαλήθευσης για προσθήκη στο καλάθι
const addToCartSchema = z.object({
  productId: z.union([z.string(), z.number()]),
  quantity: z.number().int().positive(),
  customData: z.any().optional()
});

// Σχήμα επαλήθευσης για ενημέρωση ποσότητας
const updateCartItemSchema = z.object({
  quantity: z.number().int().positive()
});

// GET /api/cart - Λήψη καλαθιού
router.get('/', async (req, res) => {
  try {
    const session = req.session as CustomSession;
    const userId = session?.userId || 'guest';
    const cartItems = session?.cart || [];
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Σφάλμα κατά τη λήψη του καλαθιού' 
    });
  }
});

// POST /api/cart - Προσθήκη στο καλάθι
router.post('/', async (req, res) => {
  try {
    const validatedData = addToCartSchema.parse(req.body);
    const session = req.session as CustomSession;
    const userId = session?.userId || 'guest';
    
    if (!session.cart) {
      session.cart = [];
    }
    
    const cart = session.cart;
    const existingItemIndex = cart.findIndex(
      (item) => item.productId === validatedData.productId
    );
    
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += validatedData.quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        customData: validatedData.customData
      };
      cart.push(newItem);
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Το προϊόν προστέθηκε στο καλάθι',
      cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({ 
      success: false,
      message: 'Σφάλμα κατά την προσθήκη στο καλάθι',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/cart/:id - Ενημέρωση ποσότητας
router.put('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const validatedData = updateCartItemSchema.parse(req.body);
    const session = req.session as CustomSession;
    
    if (!session.cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Το καλάθι δεν βρέθηκε' 
      });
    }
    
    const cart = session.cart;
    const itemIndex = cart.findIndex((item) => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Το προϊόν δεν βρέθηκε στο καλάθι' 
      });
    }
    
    cart[itemIndex].quantity = validatedData.quantity;
    
    res.json({ 
      success: true,
      message: 'Η ποσότητα ενημερώθηκε',
      cart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(400).json({ 
      success: false,
      message: 'Σφάλμα κατά την ενημέρωση του προϊόντος',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/cart/:id - Αφαίρεση από το καλάθι
router.delete('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const session = req.session as CustomSession;
    
    if (!session.cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Το καλάθι δεν βρέθηκε' 
      });
    }
    
    const cart = session.cart;
    session.cart = cart.filter((item) => item.id !== itemId);
    
    res.json({ 
      success: true,
      message: 'Το προϊόν αφαιρέθηκε από το καλάθι',
      cart: session.cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Σφάλμα κατά την αφαίρεση από το καλάθι' 
    });
  }
});

// DELETE /api/cart - Εκκαθάριση καλαθιού
router.delete('/', async (req, res) => {
  try {
    const session = req.session as CustomSession;
    session.cart = [];
    
    res.json({ 
      success: true,
      message: 'Το καλάθι εκκαθαρίστηκε',
      cart: []
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Σφάλμα κατά την εκκαθάριση του καλαθιού' 
    });
  }
});

export default router; 