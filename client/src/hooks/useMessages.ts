import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { messagesAPI } from '../services/api';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Φόρτωση όλων των μηνυμάτων
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messagesAPI.getAll();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση των μηνυμάτων');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Φόρτωση συγκεκριμένου μηνύματος
  const fetchMessage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messagesAPI.getById(id);
      setCurrentMessage(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ανάκτηση του μηνύματος');
      console.error('Error fetching message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Δημιουργία νέου μηνύματος
  const createMessage = useCallback(async (messageData: { title: string; content: string; categoryId?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messagesAPI.create(messageData);
      setMessages((prevMessages) => [data, ...prevMessages]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη δημιουργία του μηνύματος');
      console.error('Error creating message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ενημέρωση μηνύματος
  const updateMessage = useCallback(async (id: string, messageData: { title?: string; content?: string; categoryId?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await messagesAPI.update(id, messageData);
      setMessages((prevMessages) =>
        prevMessages.map((message) => (message.id === id ? data : message))
      );
      if (currentMessage?.id === id) {
        setCurrentMessage(data);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την ενημέρωση του μηνύματος');
      console.error('Error updating message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentMessage]);

  // Διαγραφή μηνύματος
  const deleteMessage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await messagesAPI.delete(id);
      setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
      if (currentMessage?.id === id) {
        setCurrentMessage(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά τη διαγραφή του μηνύματος');
      console.error('Error deleting message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentMessage]);

  // Φόρτωση δεδομένων κατά την αρχικοποίηση
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    currentMessage,
    loading,
    error,
    fetchMessages,
    fetchMessage,
    createMessage,
    updateMessage,
    deleteMessage,
  };
}; 