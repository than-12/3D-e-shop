import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

interface AuthUser {
  userId: string;
}

// Middleware για έλεγχο αν ο χρήστης είναι διαχειριστής
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Έλεγχος αν ο χρήστης είναι συνδεδεμένος
    if (!req.user) {
      return res.status(401).json({ error: 'Απαιτείται πιστοποίηση.' });
    }

    // Ανάκτηση του χρήστη από τη βάση δεδομένων
    const user = await prisma.user.findUnique({
      where: { id: (req.user as AuthUser).userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    }

    // Έλεγχος αν ο χρήστης είναι διαχειριστής
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Δεν έχετε δικαιώματα διαχειριστή.' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τον έλεγχο δικαιωμάτων διαχειριστή.' });
  }
}; 