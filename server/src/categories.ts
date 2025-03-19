import { PrismaClient } from '@prisma/client';

// Επέκταση του PrismaClient για να προσθέσουμε τα μοντέλα
declare global {
  // Επεκτείνω το PrismaClient με τα μοντέλα που χρειαζόμαστε
  namespace PrismaClient {
    interface PrismaModels {
      user: any;
      message: any;
      category: any;
    }
  }
}

export {}; 