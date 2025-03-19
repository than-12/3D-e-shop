// Configuration for the application
// Χρησιμοποιούμε το API URL από το .env αρχείο ή το localhost αν δεν είναι διαθέσιμο
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 

// Βοηθητική συνάρτηση που επιστρέφει το API URL
export async function getWorkingApiUrl() {
  const apiUrl = API_URL;
  console.log('Using API URL:', apiUrl);
  return apiUrl;
} 