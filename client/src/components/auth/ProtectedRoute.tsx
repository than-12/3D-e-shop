import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 