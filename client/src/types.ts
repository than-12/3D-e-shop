export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  parentId?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  featured: boolean;
  discount?: number;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  material?: string;
  slug?: string;
} 