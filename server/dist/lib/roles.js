const moduleAccess = {
    organization: ['ADMIN'],
    assets: ['ADMIN', 'ASSET_MANAGER'],
    allocations: ['ADMIN', 'ASSET_MANAGER'],
    bookings: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    maintenance: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    audits: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'],
    reports: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'],
    activity: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']
};
const moduleLabels = {
    organization: 'Organization Setup',
    assets: 'Asset Registry',
    allocations: 'Allocation & Transfers',
    bookings: 'Resource Booking',
    maintenance: 'Maintenance Workflow',
    audits: 'Audit Cycles',
    reports: 'Reports & Analytics',
    activity: 'Activity Logs & Notifications'
};
export function canAccessModule(role, moduleId) {
    const allowedRoles = moduleAccess[moduleId];
    return allowedRoles.includes(role);
}
export function getAccessibleModules(role) {
    return Object.entries(moduleAccess)
        .filter(([, allowedRoles]) => allowedRoles.includes(role))
        .map(([moduleId]) => moduleLabels[moduleId]);
}
export function hasAnyRole(role, allowedRoles) {
    return allowedRoles.includes(role);
}
