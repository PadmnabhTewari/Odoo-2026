import { Navigate, Outlet } from 'react-router-dom';
import { getStoredToken } from '../lib/session';

export function RequireAuth() {
  const token = getStoredToken();
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
