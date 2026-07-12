import { sidebarItems } from '../data/assetflow';
import type { EmployeeRole, ScreenId } from '../types/assetflow';

export function getEmployeeRole(role?: EmployeeRole | null): EmployeeRole {
  return role ?? 'EMPLOYEE';
}

export function getAllowedRolesForScreen(screen: ScreenId): EmployeeRole[] {
  const item = sidebarItems.find((entry) => entry.id === screen);
  return item?.allowedRoles ?? ['ADMIN'];
}

export function canAccessScreen(role: EmployeeRole | null | undefined, screen: ScreenId): boolean {
  return getAllowedRolesForScreen(screen).includes(getEmployeeRole(role));
}

export function getRolePermissions(role: EmployeeRole | null | undefined) {
  const resolvedRole = getEmployeeRole(role);
  const isAdmin = resolvedRole === 'ADMIN';
  const isAssetManager = isAdmin || resolvedRole === 'ASSET_MANAGER';
  const isDepartmentLeader = isAdmin || resolvedRole === 'DEPARTMENT_HEAD';

  return {
    role: resolvedRole,
    isAdmin,
    isAssetManager,
    isDepartmentLeader,
    canManageOrganization: isAdmin,
    canManageAssets: isAssetManager,
    canManageAllocations: isAssetManager,
    canManageAudits: isDepartmentLeader,
    canViewReports: isDepartmentLeader,
    canGenerateReports: isDepartmentLeader,
    canApproveMaintenance: isAssetManager || isDepartmentLeader
  };
}
