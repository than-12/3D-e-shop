import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import { Product } from '../types';

// Ορισμός των τύπων δεδομένων
interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  });

  // Φόρτωση όλων των προϊόντων με φίλτρα
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products with filters:', filters);
      const data: ProductsResponse = await productsAPI.getAll(filters);
      console.log('Products received:', data);
      
      // Βεβαιώνουμε ότι έχουμε έγκυρα δεδομένα
      if (data && data.products) {
        setProducts(data.products);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error('Δεν βρέθηκαν προϊόντα ή έγκυρα δεδομένα');
      }
      return data;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση των προϊόντων');
      setProducts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Φόρτωση συγκεκριμένου προϊόντος
  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: Product = await productsAPI.getById(id);
      setCurrentProduct(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση του προϊόντος');
      console.error('Error fetching product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Δημιουργία νέου προϊόντος
  const createProduct = useCallback(async (productData: {
    name: string;
    price: number;
    stock?: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
    discount?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data: Product = await productsAPI.create(productData);
      setProducts(prevProducts => [...prevProducts, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη δημιουργία του προϊόντος');
      console.error('Error creating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ενημέρωση προϊόντος
  const updateProduct = useCallback(async (id: string, productData: {
    name?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
    discount?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data: Product = await productsAPI.update(id, productData);
      setProducts(prevProducts => 
        prevProducts.map(product => product.id === id ? data : product)
      );
      if (currentProduct?.id === id) {
        setCurrentProduct(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ενημέρωση του προϊόντος');
      console.error('Error updating product:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // Διαγραφή προϊόντος
  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await productsAPI.delete(id);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      if (currentProduct?.id === id) {
        setCurrentProduct(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη διαγραφή του προϊόντος');
      console.error('Error deleting product:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // Φόρτωση προϊόντων κατά την αρχικοποίηση
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    currentProduct,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct
  };
}; 