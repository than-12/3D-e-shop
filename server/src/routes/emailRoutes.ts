import express from 'express';
import { emailController } from '../controllers/emailController';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Route για αποστολή email επιβεβαίωσης παραγγελίας
// POST /api/emails/orders/:orderId/confirmation/:userId
router.post('/orders/:orderId/confirmation/:userId', isAdmin, emailController.sendOrderConfirmation);

// Route για αποστολή email αποστολής παραγγελίας
// POST /api/emails/orders/:orderId/shipped/:userId
router.post('/orders/:orderId/shipped/:userId', isAdmin, emailController.sendOrderShipped);

// Route για αποστολή email καλωσορίσματος
// POST /api/emails/welcome/:userId
router.post('/welcome/:userId', isAdmin, emailController.sendWelcomeEmail);

// Route για αποστολή email επαναφοράς κωδικού
// POST /api/emails/reset-password
router.post('/reset-password', emailController.sendPasswordReset);

// Route για αποστολή newsletter (μόνο για διαχειριστές)
// POST /api/emails/newsletter
router.post('/newsletter', isAdmin, emailController.sendNewsletter);

export default router; 