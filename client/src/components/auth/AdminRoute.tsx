import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Όταν φορτώνει ο χρήστης, σταματάμε τη φόρτωση
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);

  // Εμφανίζουμε ένα loading state μέχρι να ξέρουμε αν ο χρήστης είναι διαχειριστής
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Αν ο χρήστης δεν είναι συνδεδεμένος, ανακατεύθυνση στο login
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Αν ο χρήστης δεν είναι διαχειριστής, ανακατεύθυνση στην αρχική σελίδα
  if (!isAdmin) {
    setLocation('/');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Δεν έχετε δικαιώματα διαχειριστή για αυτή τη σελίδα.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute; 