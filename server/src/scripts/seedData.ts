import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Ξεκινάει η διαδικασία προσθήκης δοκιμαστικών δεδομένων...');

    // Προσθήκη βασικού admin χρήστη
    const adminEmail = 'admin@3dprintcraft.gr';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await prisma.user.create({
        data: {
          name: 'Διαχειριστής',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✓ Δημιουργήθηκε ο admin χρήστης');
    } else {
      console.log('✓ Ο admin χρήστης υπάρχει ήδη');
    }

    // Προσθήκη κατηγοριών
    const categories = [
      { name: '3D Εκτυπωτές', description: 'Επαγγελματικοί και ερασιτεχνικοί 3D εκτυπωτές', imageUrl: '/images/categories/printers.jpg' },
      { name: 'Νήματα PLA', description: 'Νήματα PLA υψηλής ποιότητας για εκτυπώσεις', imageUrl: '/images/categories/pla.jpg' },
      { name: 'Νήματα ABS', description: 'Νήματα ABS για ανθεκτικές εκτυπώσεις', imageUrl: '/images/categories/abs.jpg' },
      { name: 'Ανταλλακτικά', description: 'Ανταλλακτικά και εξαρτήματα για 3D εκτυπωτές', imageUrl: '/images/categories/parts.jpg' },
      { name: 'Εργαλεία', description: 'Εργαλεία για 3D εκτύπωση και επεξεργασία', imageUrl: '/images/categories/tools.jpg' }
    ];

    for (const category of categories) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: category.name }
      });

      if (!existingCategory) {
        await prisma.category.create({ data: category });
        console.log(`✓ Δημιουργήθηκε η κατηγορία: ${category.name}`);
      } else {
        console.log(`✓ Η κατηγορία ${category.name} υπάρχει ήδη`);
      }
    }

    // Ανάκτηση των κατηγοριών για τη σύνδεση με τα προϊόντα
    const createdCategories = await prisma.category.findMany();
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    // Προσθήκη προϊόντων
    const products = [
      {
        name: 'Creality Ender 3 V2',
        description: 'Ο δημοφιλής 3D εκτυπωτής για αρχάριους και επαγγελματίες',
        price: 249.99,
        stock: 15,
        featured: true,
        imageUrl: '/images/products/ender3v2.jpg',
        categoryName: '3D Εκτυπωτές'
      },
      {
        name: 'PLA Filament 1kg Μαύρο',
        description: 'Υψηλής ποιότητας PLA νήμα, διάμετρος 1.75mm, βάρος 1kg',
        price: 24.99,
        stock: 50,
        featured: true,
        imageUrl: '/images/products/black-pla.jpg',
        categoryName: 'Νήματα PLA'
      },
      {
        name: 'ABS Filament 1kg Λευκό',
        description: 'Ανθεκτικό ABS νήμα για λειτουργικά αντικείμενα, διάμετρος 1.75mm',
        price: 29.99,
        stock: 40,
        featured: false,
        imageUrl: '/images/products/white-abs.jpg',
        categoryName: 'Νήματα ABS'
      },
      {
        name: 'Hotend Assembly E3D V6',
        description: 'Ολοκληρωμένο σετ hotend E3D V6 για αναβάθμιση του εκτυπωτή σας',
        price: 59.99,
        stock: 12,
        featured: false,
        imageUrl: '/images/products/e3d-v6.jpg',
        categoryName: 'Ανταλλακτικά'
      },
      {
        name: 'Σετ Εργαλείων 3D Εκτύπωσης',
        description: 'Πλήρες σετ εργαλείων για επεξεργασία και συντήρηση 3D εκτυπώσεων',
        price: 34.99,
        stock: 20,
        featured: true,
        imageUrl: '/images/products/toolkit.jpg',
        categoryName: 'Εργαλεία'
      }
    ];

    for (const product of products) {
      const { categoryName, ...productData } = product;
      const categoryId = categoryMap[categoryName];

      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            ...productData,
            categoryId
          }
        });
        console.log(`✓ Δημιουργήθηκε το προϊόν: ${product.name}`);
      } else {
        console.log(`✓ Το προϊόν ${product.name} υπάρχει ήδη`);
      }
    }

    console.log('Η διαδικασία προσθήκης δοκιμαστικών δεδομένων ολοκληρώθηκε επιτυχώς!');
  } catch (error) {
    console.error('Σφάλμα κατά την προσθήκη δοκιμαστικών δεδομένων:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 