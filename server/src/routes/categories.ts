import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Λήψη όλων των κατηγοριών
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση των κατηγοριών.' });
  }
});

// Λήψη μιας συγκεκριμένης κατηγορίας
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Η κατηγορία δεν βρέθηκε.' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση της κατηγορίας.' });
  }
});

// Δημιουργία νέας κατηγορίας (μόνο για διαχειριστές)
router.post('/', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Έλεγχος αν υπάρχει ήδη κατηγορία με το ίδιο όνομα
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name
        }
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Υπάρχει ήδη κατηγορία με αυτό το όνομα.' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία της κατηγορίας.' });
  }
});

// Ενημέρωση κατηγορίας (μόνο για διαχειριστές)
router.put('/:id', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Έλεγχος αν υπάρχει ήδη άλλη κατηγορία με το ίδιο όνομα
    if (name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: name
          },
          id: {
            not: id
          }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Υπάρχει ήδη άλλη κατηγορία με αυτό το όνομα.' });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση της κατηγορίας.' });
  }
});

// Διαγραφή κατηγορίας (μόνο για διαχειριστές)
router.delete('/:id', auth, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Έλεγχος αν υπάρχουν μηνύματα που χρησιμοποιούν αυτή την κατηγορία
    const messagesCount = await prisma.message.count({
      where: {
        categoryId: id
      }
    });

    if (messagesCount > 0) {
      return res.status(400).json({ 
        error: 'Δεν μπορείτε να διαγράψετε αυτή την κατηγορία γιατί χρησιμοποιείται από μηνύματα.',
        messagesCount
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Η κατηγορία διαγράφηκε επιτυχώς.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή της κατηγορίας.' });
  }
});

export default router; 