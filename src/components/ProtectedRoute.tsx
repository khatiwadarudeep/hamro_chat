import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;