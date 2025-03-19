// Σταθερά fake δεδομένα για την εφαρμογή

// Κατηγορίες
export const fakeCategories = [
  { 
    id: 1,
    name: "Figurines", 
    slug: "figurines", 
    description: "Detailed figurines", 
    icon: "chess-knight",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 2,
    name: "Home Decor", 
    slug: "home-decor", 
    description: "Home decoration items", 
    icon: "home",
    imageUrl: null,
    parentId: null
  },
  { 
    id: 3,
    name: "Gadgets", 
    slug: "gadgets", 
    description: "Useful gadgets", 
    icon: "cogs",
    imageUrl: null,
    parentId: null
  }
];

// Προϊόντα
export const fakeProducts = [
  {
    id: 1,
    name: "Dragon Figurine",
    slug: "dragon-figurine",
    description: "Detailed dragon model",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=500",
    images: ["https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=500"],
    categoryId: 1,
    material: "PLA",
    inStock: true,
    featured: true,
    rating: "4.7",
    reviewCount: 42
  },
  {
    id: 2,
    name: "Phone Stand",
    slug: "phone-stand",
    description: "Multi-angle phone holder",
    price: "14.99",
    imageUrl: "https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?auto=format&fit=crop&w=500",
    images: ["https://images.unsplash.com/photo-1576086135878-bd7e7d326dc0?auto=format&fit=crop&w=500"],
    categoryId: 3,
    material: "ABS",
    inStock: true,
    featured: true,
    rating: "5.0",
    reviewCount: 87
  }
];

// Καλάθι ως πίνακας (αντί για αντικείμενο με πεδίο items)
export const fakeCart = []; 