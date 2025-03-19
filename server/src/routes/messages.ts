import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Ορισμός διεπαφής για το αντικείμενο χρήστη στο request
interface AuthUser {
  userId: string;
}

const router = express.Router();

// Λήψη όλων των μηνυμάτων 
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    // Έλεγχος αν το μοντέλο είναι διαθέσιμο
    if (!prisma.message) {
      return res.status(500).json({ error: 'Σφάλμα στη σύνδεση με τη βάση δεδομένων' });
    }

    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση των μηνυμάτων.' });
  }
});

// Λήψη συγκεκριμένου μηνύματος με ID
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Το μήνυμα δεν βρέθηκε.' });
    }

    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση του μηνύματος.' });
  }
});

// Δημιουργία νέου μηνύματος
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Απαιτείται πιστοποίηση.' });
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

    const message = await prisma.message.create({
      data: {
        title,
        content,
        userId: (req.user as AuthUser).userId,
        categoryId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία του μηνύματος.' });
  }
});

// Ενημέρωση μηνύματος
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Απαιτείται πιστοποίηση.' });
    }

    // Έλεγχος αν υπάρχει το μήνυμα και ανήκει στον χρήστη
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Το μήνυμα δεν βρέθηκε.' });
    }

    if (existingMessage.userId !== (req.user as AuthUser).userId) {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα να επεξεργαστείτε αυτό το μήνυμα.' });
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

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        title,
        content,
        categoryId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση του μηνύματος.' });
  }
});

// Διαγραφή μηνύματος
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Απαιτείται πιστοποίηση.' });
    }

    // Έλεγχος αν υπάρχει το μήνυμα και ανήκει στον χρήστη
    const existingMessage = await prisma.message.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Το μήνυμα δεν βρέθηκε.' });
    }

    if (existingMessage.userId !== (req.user as AuthUser).userId) {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα να διαγράψετε αυτό το μήνυμα.' });
    }

    await prisma.message.delete({
      where: { id }
    });

    res.json({ message: 'Το μήνυμα διαγράφηκε επιτυχώς.' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή του μηνύματος.' });
  }
});

export default router; 