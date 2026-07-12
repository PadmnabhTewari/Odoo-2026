export type EmployeeRole = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';

const moduleAccess: Record<string, EmployeeRole[]> = {
  organization: ['ADMIN'],
  assets: ['ADMIN', 'ASSET_MANAGER'],
  allocations: ['ADMIN', 'ASSET_MANAGER'],
  bookings: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
  maintenance: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
  audits: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'],
  reports: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'],
  activity: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']
};

const moduleLabels: Record<string, string> = {
  organization: 'Organization Setup',
  assets: 'Asset Registry',
  allocations: 'Allocation & Transfers',
  bookings: 'Resource Booking',
  maintenance: 'Maintenance Workflow',
  audits: 'Audit Cycles',
  reports: 'Reports & Analytics',
  activity: 'Activity Logs & Notifications'
};

export function canAccessModule(role: string, moduleId: keyof typeof moduleAccess): boolean {
  const allowedRoles = moduleAccess[moduleId];
  return allowedRoles.includes(role as EmployeeRole);
}

export function getAccessibleModules(role: string) {
  return Object.entries(moduleAccess)
    .filter(([, allowedRoles]) => allowedRoles.includes(role as EmployeeRole))
    .map(([moduleId]) => moduleLabels[moduleId]);
}

export function hasAnyRole(role: string, allowedRoles: EmployeeRole[]) {
  return allowedRoles.includes(role as EmployeeRole);
}
