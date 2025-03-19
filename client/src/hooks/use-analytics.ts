import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { logPageView } from '@/lib/analytics';

export function useAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Όταν αλλάζει η διαδρομή, καταγράφουμε την προβολή σελίδας
    logPageView(location);
  }, [location]);

  return null;
} 