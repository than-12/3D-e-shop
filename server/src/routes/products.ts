import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';
import { body, validationResult } from 'express-validator';

interface AuthUser {
  userId: string;
}

const router = express.Router();

// Λήψη όλων των προϊόντων (δημόσιο)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, featured, search, sortBy = 'createdAt', order = 'desc', limit = 10, page = 1 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    
    // Συνθήκες φιλτραρίσματος
    const where: any = {};
    
    if (category) {
      where.categoryId = category as string;
    }
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }
    
    // Ταξινόμηση
    let orderBy: any = {};
    if (sortBy && ['name', 'price', 'createdAt'].includes(sortBy as string)) {
      orderBy[sortBy as string] = order === 'asc' ? 'asc' : 'desc';
    }
    
    // Εκτέλεση αναζήτησης
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: true
      }
    });
    
    // Συνολικός αριθμός προϊόντων
    const total = await prisma.product.count({ where });
    
    res.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: Number(page),
        limit: take
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση των προϊόντων.' });
  }
});

// Λήψη ενός προϊόντος με ID (δημόσιο)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε.' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση του προϊόντος.' });
  }
});

// Δημιουργία προϊόντος (μόνο admin)
router.post(
  '/',
  auth,
  isAdmin,
  [
    body('name').notEmpty().withMessage('Το όνομα προϊόντος είναι υποχρεωτικό.'),
    body('price').isFloat({ min: 0 }).withMessage('Η τιμή πρέπει να είναι θετικός αριθμός.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Το απόθεμα πρέπει να είναι θετικός αριθμός.'),
    body('categoryId').optional(),
    body('description').optional(),
    body('imageUrl').optional(),
    body('featured').optional().isBoolean(),
    body('discount').optional().isFloat({ min: 0 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, price, stock = 0, categoryId, description, imageUrl, featured = false, discount } = req.body;
      
      // Έλεγχος αν υπάρχει η κατηγορία
      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId }
        });
        
        if (!categoryExists) {
          return res.status(400).json({ error: 'Η κατηγορία δεν βρέθηκε.' });
        }
      }
      
      const product = await prisma.product.create({
        data: {
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId,
          description,
          imageUrl,
          featured,
          discount: discount ? parseFloat(discount) : null
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία του προϊόντος.' });
    }
  }
);

// Ενημέρωση προϊόντος (μόνο admin)
router.put(
  '/:id',
  auth,
  isAdmin,
  [
    body('name').optional().notEmpty().withMessage('Το όνομα προϊόντος δεν μπορεί να είναι κενό.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Η τιμή πρέπει να είναι θετικός αριθμός.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Το απόθεμα πρέπει να είναι θετικός αριθμός.'),
    body('categoryId').optional(),
    body('description').optional(),
    body('imageUrl').optional(),
    body('featured').optional().isBoolean(),
    body('discount').optional().isFloat({ min: 0 })
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { name, price, stock, categoryId, description, imageUrl, featured, discount } = req.body;
      
      // Έλεγχος αν υπάρχει το προϊόν
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε.' });
      }
      
      // Έλεγχος αν υπάρχει η κατηγορία
      if (categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: categoryId }
        });
        
        if (!categoryExists) {
          return res.status(400).json({ error: 'Η κατηγορία δεν βρέθηκε.' });
        }
      }
      
      // Ενημέρωση του προϊόντος
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (description !== undefined) updateData.description = description;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (featured !== undefined) updateData.featured = featured;
      if (discount !== undefined) updateData.discount = discount !== null ? parseFloat(discount) : null;
      
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData
      });
      
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση του προϊόντος.' });
    }
  }
);

// Διαγραφή προϊόντος (μόνο admin)
router.delete('/:id', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Έλεγχος αν υπάρχει το προϊόν
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Το προϊόν δεν βρέθηκε.' });
    }
    
    // Διαγραφή του προϊόντος
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Το προϊόν διαγράφηκε επιτυχώς.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή του προϊόντος.' });
  }
});

export default router; 