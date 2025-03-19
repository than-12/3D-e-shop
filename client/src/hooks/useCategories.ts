import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types';
import { categoriesAPI } from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Φόρτωση όλων των κατηγοριών
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση των κατηγοριών');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Φόρτωση συγκεκριμένης κατηγορίας
  const fetchCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesAPI.getById(id);
      setCurrentCategory(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση της κατηγορίας');
      console.error('Error fetching category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Δημιουργία νέας κατηγορίας
  const createCategory = useCallback(async (categoryData: { name: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesAPI.create(categoryData);
      setCategories((prevCategories) => [...prevCategories, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη δημιουργία της κατηγορίας');
      console.error('Error creating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ενημέρωση κατηγορίας
  const updateCategory = useCallback(async (id: string, categoryData: { name?: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesAPI.update(id, categoryData);
      setCategories((prevCategories) =>
        prevCategories.map((category) => (category.id === id ? data : category))
      );
      if (currentCategory?.id === id) {
        setCurrentCategory(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ενημέρωση της κατηγορίας');
      console.error('Error updating category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  // Διαγραφή κατηγορίας
  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesAPI.delete(id);
      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== id));
      if (currentCategory?.id === id) {
        setCurrentCategory(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη διαγραφή της κατηγορίας');
      console.error('Error deleting category:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  // Φόρτωση δεδομένων κατά την αρχικοποίηση
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    currentCategory,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}; 