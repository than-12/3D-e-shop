import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { Order } from '../models/order';
import { User } from '../models/user';

/**
 * Email Controller για τη διαχείριση αποστολής emails
 */
export const emailController = {
  /**
   * Αποστολή email επιβεβαίωσης παραγγελίας
   */
  sendOrderConfirmation: async (req: Request, res: Response) => {
    try {
      const { orderId, userId } = req.params;
      
      // Σε ένα πραγματικό σενάριο, θα ανακτούσαμε τα δεδομένα από τη βάση δεδομένων
      // Για τους σκοπούς αυτού του παραδείγματος, χρησιμοποιούμε mock δεδομένα
      
      // Mock δεδομένα χρήστη
      const user: User = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Γιάννης',
        lastName: 'Παπαδόπουλος',
        password: 'hashed_password',
        role: 'user',
        phone: '6944123456',
        address: {
          street: 'Σοφοκλέους 15',
          city: 'Αθήνα',
          postalCode: '10552',
          country: 'Ελλάδα'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscribedToNewsletter: true
      };
      
      // Mock δεδομένα παραγγελίας
      const order: Order = {
        id: orderId,
        userId: userId,
        items: [
          {
            productId: 'prod-1',
            name: '3D Μοντέλο Πύργου του Άιφελ',
            quantity: 1,
            price: 25.99,
            totalPrice: 25.99,
            image: '/images/products/eiffel-tower.jpg'
          },
          {
            productId: 'prod-2',
            name: 'Προσαρμοσμένη Θήκη iPhone',
            quantity: 2,
            price: 15.50,
            totalPrice: 31.00,
            image: '/images/products/iphone-case.jpg'
          }
        ],
        totalAmount: 56.99,
        status: 'pending',
        paymentStatus: 'completed',
        paymentMethod: 'credit_card',
        shippingAddress: {
          firstName: 'Γιάννης',
          lastName: 'Παπαδόπουλος',
          street: 'Σοφοκλέους 15',
          city: 'Αθήνα',
          postalCode: '10552',
          country: 'Ελλάδα',
          phone: '6944123456'
        },
        billingAddress: {
          firstName: 'Γιάννης',
          lastName: 'Παπαδόπουλος',
          street: 'Σοφοκλέους 15',
          city: 'Αθήνα',
          postalCode: '10552',
          country: 'Ελλάδα',
          vatNumber: '123456789'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Αποστολή email
      await emailService.sendOrderConfirmation(order, user);
      
      return res.status(200).json({ success: true, message: 'Το email επιβεβαίωσης παραγγελίας στάλθηκε επιτυχώς' });
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή email επιβεβαίωσης παραγγελίας:', error);
      return res.status(500).json({ success: false, message: 'Δεν ήταν δυνατή η αποστολή του email επιβεβαίωσης', error: error });
    }
  },
  
  /**
   * Αποστολή email αποστολής παραγγελίας
   */
  sendOrderShipped: async (req: Request, res: Response) => {
    try {
      const { orderId, userId } = req.params;
      const { trackingNumber } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({ success: false, message: 'Ο αριθμός παρακολούθησης είναι υποχρεωτικός' });
      }
      
      // Σε ένα πραγματικό σενάριο, θα ανακτούσαμε τα δεδομένα από τη βάση δεδομένων
      // Mock δεδομένα όπως παραπάνω...
      
      // Mock δεδομένα χρήστη
      const user: User = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Γιάννης',
        lastName: 'Παπαδόπουλος',
        password: 'hashed_password',
        role: 'user',
        phone: '6944123456',
        address: {
          street: 'Σοφοκλέους 15',
          city: 'Αθήνα',
          postalCode: '10552',
          country: 'Ελλάδα'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscribedToNewsletter: true
      };
      
      // Mock δεδομένα παραγγελίας
      const order: Order = {
        id: orderId,
        userId: userId,
        items: [
          {
            productId: 'prod-1',
            name: '3D Μοντέλο Πύργου του Άιφελ',
            quantity: 1,
            price: 25.99,
            totalPrice: 25.99,
            image: '/images/products/eiffel-tower.jpg'
          }
        ],
        totalAmount: 25.99,
        status: 'shipped',
        paymentStatus: 'completed',
        paymentMethod: 'credit_card',
        shippingAddress: {
          firstName: 'Γιάννης',
          lastName: 'Παπαδόπουλος',
          street: 'Σοφοκλέους 15',
          city: 'Αθήνα',
          postalCode: '10552',
          country: 'Ελλάδα',
          phone: '6944123456'
        },
        trackingNumber: trackingNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: new Date()
      };
      
      // Αποστολή email
      await emailService.sendOrderShipped(order, user, trackingNumber);
      
      return res.status(200).json({ success: true, message: 'Το email αποστολής παραγγελίας στάλθηκε επιτυχώς' });
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή email αποστολής παραγγελίας:', error);
      return res.status(500).json({ success: false, message: 'Δεν ήταν δυνατή η αποστολή του email αποστολής', error: error });
    }
  },
  
  /**
   * Αποστολή email καλωσορίσματος
   */
  sendWelcomeEmail: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Σε ένα πραγματικό σενάριο, θα ανακτούσαμε τα δεδομένα από τη βάση δεδομένων
      // Mock δεδομένα χρήστη
      const user: User = {
        id: userId,
        email: 'newuser@example.com',
        firstName: 'Μαρία',
        lastName: 'Γεωργίου',
        password: 'hashed_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscribedToNewsletter: true
      };
      
      // Αποστολή email
      await emailService.sendWelcomeEmail(user);
      
      return res.status(200).json({ success: true, message: 'Το email καλωσορίσματος στάλθηκε επιτυχώς' });
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή email καλωσορίσματος:', error);
      return res.status(500).json({ success: false, message: 'Δεν ήταν δυνατή η αποστολή του email καλωσορίσματος', error: error });
    }
  },
  
  /**
   * Αποστολή email επαναφοράς κωδικού
   */
  sendPasswordReset: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Το email είναι υποχρεωτικό' });
      }
      
      // Σε ένα πραγματικό σενάριο, θα ανακτούσαμε τον χρήστη από τη βάση δεδομένων και θα δημιουργούσαμε ένα token
      // Mock δεδομένα χρήστη
      const user: User = {
        id: 'usr-123',
        email: email,
        firstName: 'Αλέξανδρος',
        lastName: 'Δημητρίου',
        password: 'hashed_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscribedToNewsletter: false
      };
      
      // Δημιουργία mock token
      const resetToken = 'abcdef123456';
      
      // Αποστολή email
      await emailService.sendPasswordReset(user, resetToken);
      
      return res.status(200).json({ success: true, message: 'Το email επαναφοράς κωδικού στάλθηκε επιτυχώς' });
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή email επαναφοράς κωδικού:', error);
      return res.status(500).json({ success: false, message: 'Δεν ήταν δυνατή η αποστολή του email επαναφοράς κωδικού', error: error });
    }
  },
  
  /**
   * Αποστολή newsletter σε εγγεγραμμένους χρήστες
   */
  sendNewsletter: async (req: Request, res: Response) => {
    try {
      const { subject, templateName, data } = req.body;
      
      if (!subject || !templateName) {
        return res.status(400).json({ success: false, message: 'Το θέμα και το όνομα template είναι υποχρεωτικά' });
      }
      
      // Σε ένα πραγματικό σενάριο, θα ανακτούσαμε τους εγγεγραμμένους χρήστες από τη βάση δεδομένων
      // Mock λίστα συνδρομητών
      const subscribers = [
        'subscriber1@example.com',
        'subscriber2@example.com',
        'subscriber3@example.com',
        // ... και άλλους συνδρομητές
      ];
      
      // Αποστολή newsletter
      await emailService.sendNewsletterToSubscribers(subscribers, subject, templateName, data || {});
      
      return res.status(200).json({ success: true, message: `Το newsletter στάλθηκε επιτυχώς σε ${subscribers.length} συνδρομητές` });
    } catch (error) {
      console.error('Σφάλμα κατά την αποστολή newsletter:', error);
      return res.status(500).json({ success: false, message: 'Δεν ήταν δυνατή η αποστολή του newsletter', error: error });
    }
  }
}; 