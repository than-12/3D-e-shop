import express from 'express';

const router = express.Router();

// === MOCK DATA ===
// Κατηγορίες
const categories = [
  { 
    id: 1,
    name: "Figurines", 
    slug: "figurines", 
    description: "Detailed figurines for collectors and tabletop gaming", 
    icon: "chess-knight",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 2,
    name: "Home Decor", 
    slug: "home-decor", 
    description: "Decorative items for your home", 
    icon: "home",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 3,
    name: "Gadgets", 
    slug: "gadgets", 
    description: "Useful gadgets and accessories", 
    icon: "cogs",
    imageUrl: null,
    parentId: null
  }
];

// Προϊόντα
const products = [
  {
    id: 1,
    name: "Dragon Figurine",
    slug: "dragon-figurine",
    description: "Detailed fantasy dragon model, perfect for collectors and tabletop gaming.",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    images: ["https://images.unsplash.com/photo-1559563362-c667ba5f5480?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
    categoryId: 1,
    material: "PLA",
    inStock: true,
    featured: true,
    rating: "4.7",
    reviewCount: 42
  },
  {
    id: 2,
    name: "Adjustable Phone Stand",
    slug: "adjustable-phone-stand",
    description: "Multi-angle smartphone holder, suitable for all devices up to 7 inches.",
    price: "14.99",
    imageUrl: "https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
    images: ["https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"],
    categoryId: 3,
    material: "ABS",
    inStock: true,
    featured: true,
    rating: "5.0",
    reviewCount: 87
  }
];

// Κενό καλάθι
const emptyCart = {
  items: [],
  total: "0.00"
};

// === API ROUTES ===

// Fake data route - επιστρέφει όλα τα mock δεδομένα
router.get('/mock-data', (req, res) => {
  console.log('Serving all mock data');
  res.json({
    categories,
    products,
    cart: emptyCart
  });
});

// GET /api/mock/categories
router.get('/mock/categories', (req, res) => {
  console.log('Serving mock categories');
  res.json(categories);
});

// GET /api/mock/products
router.get('/mock/products', (req, res) => {
  console.log('Serving mock products');
  res.json(products);
});

// GET /api/mock/products/:slug
router.get('/mock/products/:slug', (req, res) => {
  console.log(`Serving mock product with slug: ${req.params.slug}`);
  const product = products.find(p => p.slug === req.params.slug);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// GET /api/mock/cart
router.get('/mock/cart', (req, res) => {
  console.log('Serving mock cart');
  res.json(emptyCart);
});

// Fallback για τα παλιά endpoints
router.get('/categories', (req, res) => {
  console.log('Serving categories from fallback');
  res.json(categories);
});

router.get('/products', (req, res) => {
  console.log('Serving products from fallback');
  res.json(products);
});

router.get('/cart', (req, res) => {
  console.log('Serving cart from fallback');
  res.json(emptyCart);
});

export default router; 