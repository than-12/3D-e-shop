import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Ξεκινάει η προσθήκη δοκιμαστικών δεδομένων...');

    // Προσθήκη κατηγοριών
    const categories = [
      { name: '3D Εκτυπωτές', description: 'Επαγγελματικοί και ερασιτεχνικοί 3D εκτυπωτές' },
      { name: 'Νήματα PLA', description: 'Νήματα PLA υψηλής ποιότητας για εκτυπώσεις' },
      { name: 'Ανταλλακτικά', description: 'Ανταλλακτικά και εξαρτήματα για 3D εκτυπωτές' }
    ];

    for (const category of categories) {
      await prisma.category.create({ data: category });
      console.log(`✓ Δημιουργήθηκε η κατηγορία: ${category.name}`);
    }

    // Προσθήκη προϊόντων
    const products = [
      {
        name: 'Creality Ender 3 V2',
        description: 'Ο δημοφιλής 3D εκτυπωτής για αρχάριους και επαγγελματίες',
        price: 249.99,
        stock: 15,
        featured: true,
        categoryId: (await prisma.category.findFirst({ where: { name: '3D Εκτυπωτές' } }))?.id
      },
      {
        name: 'PLA Filament 1kg Μαύρο',
        description: 'Υψηλής ποιότητας PLA νήμα, διάμετρος 1.75mm, βάρος 1kg',
        price: 24.99,
        stock: 50,
        featured: true,
        categoryId: (await prisma.category.findFirst({ where: { name: 'Νήματα PLA' } }))?.id
      }
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
      console.log(`✓ Δημιουργήθηκε το προϊόν: ${product.name}`);
    }

    console.log('Η διαδικασία ολοκληρώθηκε επιτυχώς!');
  } catch (error) {
    console.error('Σφάλμα:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 