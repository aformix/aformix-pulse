import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullPageLoading } from './ui/LoadingSpinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoading />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the original destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
