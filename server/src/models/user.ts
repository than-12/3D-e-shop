export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Θα είναι κρυπτογραφημένος
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isSubscribedToNewsletter: boolean;
} 