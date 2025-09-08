import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/shared/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: UserType;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check user type if required
  if (requiredUserType && user.type !== requiredUserType) {
    // Redirect based on user type
    const userTypeRedirects: Record<string, string> = {
      'consumer': '/dashboard',
      'enterprise': '/enterprise/dashboard',
      'power-user': '/power-user/dashboard',
    };

    const redirectPath = userTypeRedirects[user.type];

    // If user type is not recognized, redirect to login
    if (!redirectPath) {
      console.warn(`Unknown user type: ${user.type}. Redirecting to login.`);
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
