import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

async function createAdminUser() {
  try {
    // Έλεγχος αν υπάρχει ήδη ο admin χρήστης
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@3dprintcraft.gr' }
    });

    if (existingAdmin) {
      console.log('👤 Ο διαχειριστής υπάρχει ήδη.');
      return;
    }

    // Δημιουργία admin χρήστη
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@3dprintcraft.gr',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN'
      }
    });

    console.log('✅ Ο διαχειριστής δημιουργήθηκε με επιτυχία:', admin.email);
  } catch (error) {
    console.error('❌ Σφάλμα κατά τη δημιουργία του διαχειριστή:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 