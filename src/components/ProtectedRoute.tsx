import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type User } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
}

const homeForRole = (role: User['role']) => {
  if (role === 'SUPER_ADMIN') return '/superadmin/overview';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/';
};

/** Redirect unauthenticated users to Login and reject users without the required role. */
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
};
