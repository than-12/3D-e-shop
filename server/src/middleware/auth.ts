import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Middleware για την επαλήθευση του JWT token
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Έλεγχος αν υπάρχει token στα headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Απαιτείται πιστοποίηση.' });
    }

    // Επαλήθευση του token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Μη έγκυρο token.' });
    }

    // Έλεγχος αν υπάρχει ο χρήστης στη βάση δεδομένων
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Ο χρήστης δεν βρέθηκε.' });
    }

    // Προσθήκη των πληροφοριών του χρήστη στο request
    req.user = {
      userId: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Μη έγκυρο token.' });
  }
}; 