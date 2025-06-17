import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const location = useLocation();
  
  // First check if there's a token in Redux state
  if (!token) {
    // Also check localStorage as a fallback
    const localToken = localStorage.getItem('token');
    
    if (!localToken) {
      console.log('No authentication token found, redirecting to login');
      
      // Store the current path for redirect after login
      localStorage.setItem('redirectAfterLogin', location.pathname);
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
