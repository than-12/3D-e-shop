const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('====== Λίστα Χρηστών ======');
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Όνομα: ${user.name}`);
      console.log(`Ρόλος: ${user.role}`);
      console.log(`Ημερομηνία εγγραφής: ${user.createdAt}`);
      console.log('---------------------------');
    });
    
    console.log(`Σύνολο χρηστών: ${users.length}`);
  } catch (error) {
    console.error('❌ Σφάλμα κατά την ανάκτηση των χρηστών:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers(); 