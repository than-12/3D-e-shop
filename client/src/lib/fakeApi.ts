// Fake API client που χρησιμοποιεί σταθερά δεδομένα
import { fakeCategories, fakeProducts, fakeCart } from './fakeData';

// Εξάγουμε το fake API ως default
const fakeApi = {
  // Κατηγορίες
  getCategories: () => {
    console.log('Fake API: Returning categories');
    return Promise.resolve(fakeCategories);
  },
  
  // Προϊόντα
  getProducts: () => {
    console.log('Fake API: Returning products');
    return Promise.resolve(fakeProducts);
  },
  
  // Προϊόν με συγκεκριμένο slug
  getProductBySlug: (slug: string) => {
    console.log(`Fake API: Looking for product with slug: ${slug}`);
    const product = fakeProducts.find(p => p.slug === slug);
    
    if (product) {
      return Promise.resolve(product);
    }
    
    return Promise.reject(new Error(`Product with slug ${slug} not found`));
  },
  
  // Καλάθι - τώρα επιστρέφει πίνακα
  getCart: () => {
    console.log('Fake API: Returning cart items');
    return Promise.resolve(fakeCart); // Το fakeCart είναι τώρα πίνακας
  },
  
  // Προσθήκη στο καλάθι
  addToCart: (productId: number, quantity: number = 1) => {
    console.log(`Fake API: Adding product ${productId} to cart, quantity: ${quantity}`);
    
    // Βρίσκουμε το προϊόν από τη λίστα των προϊόντων
    const product = fakeProducts.find(p => p.id === productId);
    
    if (!product) {
      return Promise.reject(new Error(`Product with id ${productId} not found`));
    }
    
    // Επιστρέφουμε ένα cart item με όλα τα απαραίτητα στοιχεία
    return Promise.resolve({
      id: Date.now(), // Μοναδικό ID
      productId,
      quantity,
      userId: null,
      product: product, // Προσθέτουμε το πλήρες αντικείμενο του προϊόντος
      addedAt: new Date()
    });
  },
  
  // Αφαίρεση από το καλάθι
  removeFromCart: (itemId: number) => {
    console.log(`Fake API: Removing item ${itemId} from cart`);
    return Promise.resolve({ success: true });
  },
  
  // Εκκαθάριση καλαθιού
  clearCart: () => {
    console.log('Fake API: Clearing cart');
    return Promise.resolve({ success: true });
  },
  
  // Αποστολή μηνύματος επικοινωνίας
  sendContactMessage: (data: any) => {
    console.log('Fake API: Sending contact message', data);
    return Promise.resolve({ 
      success: true, 
      message: 'Your message has been sent successfully.' 
    });
  }
};

export default fakeApi; 