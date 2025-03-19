import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth';
import prisma from '../lib/prisma';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';

const router = express.Router();

interface AuthUser {
  userId: string;
}

// Εγγραφή νέου χρήστη
router.post('/register', [
  body('name').not().isEmpty().withMessage('Το όνομα είναι υποχρεωτικό'),
  body('email').isEmail().withMessage('Παρακαλώ δώστε ένα έγκυρο email'),
  body('password').isLength({ min: 6 }).withMessage('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
], async (req: Request, res: Response) => {
  try {
    // Έλεγχος σφαλμάτων επικύρωσης
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Έλεγχος αν υπάρχει ήδη χρήστης με αυτό το email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Το email χρησιμοποιείται ήδη.' });
    }

    // Κρυπτογράφηση του κωδικού
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Δημιουργία του νέου χρήστη
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER' // Προεπιλεγμένος ρόλος
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Δημιουργία JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Ο χρήστης δημιουργήθηκε με επιτυχία.',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.' });
  }
});

// Σύνδεση χρήστη
router.post('/login', [
  body('email').isEmail().withMessage('Παρακαλώ δώστε ένα έγκυρο email'),
  body('password').isLength({ min: 6 }).withMessage('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
], async (req: Request, res: Response) => {
  try {
    // Έλεγχος σφαλμάτων επικύρωσης
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Αναζήτηση χρήστη με το συγκεκριμένο email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Μη έγκυρα διαπιστευτήρια.' });
    }

    // Έλεγχος κωδικού
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Μη έγκυρα διαπιστευτήρια.' });
    }

    // Δημιουργία JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    // Αφαίρεση του πεδίου password από την απάντηση
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Επιτυχής σύνδεση.',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.' });
  }
});

// Αποσύνδεση χρήστη
router.post('/logout', auth, (req: Request, res: Response) => {
  // Στο frontend ο χρήστης θα διαγράψει το token
  res.json({ message: 'Επιτυχής αποσύνδεση.' });
});

// Ανάκτηση πληροφοριών συνδεδεμένου χρήστη
router.get('/me', auth, async (req: Request, res: Response) => {
  try {
    // Ανάκτηση πληροφοριών χρήστη από τη βάση (χωρίς τον κωδικό)
    if (!(req.user as AuthUser)?.userId) {
      return res.status(401).json({ error: 'Δεν είστε συνδεδεμένος.' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: (req.user as AuthUser).userId },
      select: {
        id: true,
        name: true,
        email: true,
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
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση πληροφοριών χρήστη.' });
  }
});

export default router; 