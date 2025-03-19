import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Επεκτείνω τον τύπο Request για να συμπεριλάβω το userId και το userRole
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// Middleware για έλεγχο αν ο χρήστης είναι συνδεδεμένος
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Λήψη του token από το header ή από τα cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Δεν έχετε συνδεθεί' });
    }
    
    // Επαλήθευση του token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Προσθήκη του userId και του role στο request object
    req.userId = (decoded as any).userId;
    req.userRole = (decoded as any).role;
    
    next();
  } catch (error) {
    console.error('Σφάλμα κατά την επαλήθευση του token:', error);
    return res.status(401).json({ success: false, message: 'Μη έγκυρο token' });
  }
};

// Middleware για έλεγχο αν ο χρήστης είναι διαχειριστής
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Πρώτα ελέγχουμε αν ο χρήστης είναι συνδεδεμένος
  isAuthenticated(req, res, () => {
    // Έλεγχος αν ο χρήστης έχει ρόλο admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Δεν έχετε δικαιώματα για αυτή την ενέργεια' });
    }
    
    next();
  });
}; 