import { Navigate, Outlet } from 'react-router-dom';

export function RequireAuth() {
  const token = localStorage.getItem('assetflow_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
