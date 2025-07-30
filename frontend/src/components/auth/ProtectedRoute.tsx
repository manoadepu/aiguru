import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  
  console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading, currentUser });
  
  if (loading) {
    console.log('ProtectedRoute - Still loading, showing spinner');
    // You could render a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute - Authenticated, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
