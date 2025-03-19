import express from 'express';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Λήψη όλων των χρηστών (μόνο για διαχειριστές)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση των χρηστών.' });
  }
});

// Λήψη συγκεκριμένου χρήστη (μόνο για διαχειριστές)
router.get('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση του χρήστη.' });
  }
});

// Ενημέρωση χρήστη (μόνο για διαχειριστές)
router.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Έλεγχος αν υπάρχει ήδη χρήστης με το συγκεκριμένο email
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id } // Εξαιρούμε τον ίδιο χρήστη από τον έλεγχο
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Το email χρησιμοποιείται ήδη από άλλον χρήστη.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση του χρήστη.' });
  }
});

// Διαγραφή χρήστη (μόνο για διαχειριστές)
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Έλεγχος αν υπάρχει ο χρήστης
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    }

    // Έλεγχος αν ο χρήστης είναι ο ίδιος ο διαχειριστής
    if (user.id === (req as any).user?.userId) {
      return res.status(400).json({ error: 'Δεν μπορείτε να διαγράψετε τον εαυτό σας.' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Ο χρήστης διαγράφηκε επιτυχώς.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή του χρήστη.' });
  }
});

export default router; 