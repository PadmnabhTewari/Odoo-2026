import { Navigate, Outlet } from 'react-router-dom';
import { canAccessScreen } from '../lib/roles';
import { getStoredEmployee } from '../lib/session';
import type { EmployeeRole, ScreenId } from '../types/assetflow';

type RequireRoleProps = {
  screen: ScreenId;
  allowedRoles?: EmployeeRole[];
};

export function RequireRole({ screen, allowedRoles }: RequireRoleProps) {
  const employee = getStoredEmployee();
  const role = employee?.role;
  const permitted = allowedRoles
    ? allowedRoles.includes(role ?? 'EMPLOYEE')
    : canAccessScreen(role, screen);

  if (!permitted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
