import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  featureName?: string;
}

export const ProtectedRoute = ({ children, featureName = 'in-site features' }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname, featureName, requireLoginFirst: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
