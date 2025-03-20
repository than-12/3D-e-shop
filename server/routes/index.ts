import { Router } from 'express';

const router = Router();

// Διαδρομή welcome
router.get('/', (_req, res) => {
  res.json({ message: 'Welcome to 3D Print Shop API' });
});

export default router; 