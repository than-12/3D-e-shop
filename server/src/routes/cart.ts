import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
    // Για απλότητα χρησιμοποιούμε ένα τοπικό storage αντί για σύνδεση με βάση
    // Σε πραγματική εφαρμογή θα χρησιμοποιούσαμε το user ID από το session
    const userId = req.session?.userId || 'guest';
    
    // Προσωρινή υλοποίηση με πλασματικά δεδομένα
    const cartItems = req.session?.cart || [];
    
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
    const userId = req.session?.userId || 'guest';
    
    // Δημιουργία καλαθιού αν δεν υπάρχει
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Έλεγχος αν το προϊόν υπάρχει ήδη στο καλάθι
    const existingItemIndex = req.session.cart.findIndex(
      (item: any) => item.productId === validatedData.productId
    );
    
    if (existingItemIndex !== -1) {
      // Ενημέρωση ποσότητας αν υπάρχει ήδη
      req.session.cart[existingItemIndex].quantity += validatedData.quantity;
    } else {
      // Προσθήκη νέου αντικειμένου
      const newItem = {
        id: Date.now(), // Απλό ID για το session storage
        productId: validatedData.productId,
        quantity: validatedData.quantity,
        customData: validatedData.customData
      };
      req.session.cart.push(newItem);
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Το προϊόν προστέθηκε στο καλάθι',
      cart: req.session.cart
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
    
    if (!req.session.cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Το καλάθι δεν βρέθηκε' 
      });
    }
    
    const itemIndex = req.session.cart.findIndex((item: any) => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Το προϊόν δεν βρέθηκε στο καλάθι' 
      });
    }
    
    // Ενημέρωση ποσότητας
    req.session.cart[itemIndex].quantity = validatedData.quantity;
    
    res.json({ 
      success: true,
      message: 'Η ποσότητα ενημερώθηκε',
      cart: req.session.cart
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
    
    if (!req.session.cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Το καλάθι δεν βρέθηκε' 
      });
    }
    
    // Αφαίρεση του προϊόντος από το καλάθι
    req.session.cart = req.session.cart.filter((item: any) => item.id !== itemId);
    
    res.json({ 
      success: true,
      message: 'Το προϊόν αφαιρέθηκε από το καλάθι',
      cart: req.session.cart
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
    // Εκκαθάριση καλαθιού
    req.session.cart = [];
    
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