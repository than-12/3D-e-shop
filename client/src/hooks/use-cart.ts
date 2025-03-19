import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api"; // Χρησιμοποιούμε το apiClient από το api.ts

// Ορισμός των τύπων inline
interface User {
  id: number;
  username: string;
  email: string;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddingItem, setIsAddingItem] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/me'],
  });

  // Χρησιμοποιούμε νέο query function με το fake API
  const { data: cartItems, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      try {
        return await apiClient.getCart();
      } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
      }
    },
    retry: 3
  });

  // Χειρισμός σφαλμάτων με useEffect
  useEffect(() => {
    if (error) {
      console.error("Σφάλμα φόρτωσης καλαθιού:", error);
      toast({
        title: "Σφάλμα φόρτωσης καλαθιού",
        description: "Παρουσιάστηκε πρόβλημα κατά τη φόρτωση του καλαθιού σας.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Προσθήκη προϊόντος στο καλάθι
  const addItem = async (item: any) => {
    setIsAddingItem(true);
    try {
      // Ειδική διαχείριση για lithophane ή άλλα custom προϊόντα
      if (typeof item.id === 'string' && item.id.startsWith('lithophane-')) {
        console.log("Προσθήκη custom lithophane στο καλάθι:", { id: item.id, type: item.type });
        await apiClient.addToCart(item.id, item.quantity || 1, item);
      } else {
        // Κανονική ροή για τυπικά προϊόντα
        await apiClient.addToCart(item.id, item.quantity || 1);
      }
      
      // Ενημέρωση της cache
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Προστέθηκε στο καλάθι",
        description: "Το προϊόν προστέθηκε στο καλάθι σας.",
      });
    } catch (error) {
      console.error("Σφάλμα προσθήκης στο καλάθι:", error);
      toast({
        title: "Σφάλμα προσθήκης",
        description: "Δεν ήταν δυνατή η προσθήκη του προϊόντος στο καλάθι.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  // Αφαίρεση προϊόντος από το καλάθι
  const removeItem = async (itemId: number) => {
    try {
      await apiClient.removeFromCart(itemId);
      
      // Ενημέρωση της cache
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Αφαιρέθηκε από το καλάθι",
        description: "Το προϊόν αφαιρέθηκε από το καλάθι σας.",
      });
    } catch (error) {
      console.error("Σφάλμα αφαίρεσης από το καλάθι:", error);
      toast({
        title: "Σφάλμα αφαίρεσης",
        description: "Δεν ήταν δυνατή η αφαίρεση του προϊόντος από το καλάθι.",
        variant: "destructive",
      });
    }
  };

  // Εκκαθάριση καλαθιού
  const clearCart = async () => {
    try {
      await apiClient.clearCart();
      
      // Ενημέρωση της cache
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Το καλάθι εκκαθαρίστηκε",
        description: "Όλα τα προϊόντα αφαιρέθηκαν από το καλάθι σας.",
      });
    } catch (error) {
      console.error("Σφάλμα εκκαθάρισης καλαθιού:", error);
      toast({
        title: "Σφάλμα εκκαθάρισης",
        description: "Δεν ήταν δυνατή η εκκαθάριση του καλαθιού σας.",
        variant: "destructive",
      });
    }
  };

  return {
    user,
    cartItems,
    isLoading,
    isAddingItem,
    addItem,
    removeItem,
    clearCart,
    refetchCart: refetch
  };
} 