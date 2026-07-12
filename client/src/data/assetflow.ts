import type { ActivityItem, EmployeeRole, KpiCard, ScreenCard, ScreenId } from '../types/assetflow';

export const sidebarItems: { id: ScreenId; path: string; label: string; caption: string; allowedRoles: EmployeeRole[] }[] = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', caption: 'Operational snapshot', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
  { id: 'organization', path: '/organization', label: 'Organization Setup', caption: 'Departments and roles', allowedRoles: ['ADMIN'] },
  { id: 'assets', path: '/assets', label: 'Asset Directory', caption: 'Register and track assets', allowedRoles: ['ADMIN', 'ASSET_MANAGER'] },
  { id: 'allocations', path: '/allocations', label: 'Allocation & Transfer', caption: 'Conflict-safe handoffs', allowedRoles: ['ADMIN', 'ASSET_MANAGER'] },
  { id: 'bookings', path: '/bookings', label: 'Resource Booking', caption: 'Calendar and overlap checks', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
  { id: 'maintenance', path: '/maintenance', label: 'Maintenance', caption: 'Approval workflow', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] },
  { id: 'audits', path: '/audits', label: 'Audits', caption: 'Cycle verification', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'] },
  { id: 'reports', path: '/reports', label: 'Reports', caption: 'Analytics and exports', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'] },
  { id: 'activity', path: '/activity', label: 'Activity Logs', caption: 'Notifications and traceability', allowedRoles: ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE'] }
];

export const kpis: KpiCard[] = [
  { label: 'Assets Available', value: '214', delta: '+12 this week', tone: 'aurora' },
  { label: 'Assets Allocated', value: '86', delta: '+3 today', tone: 'ember' },
  { label: 'Maintenance Today', value: '7', delta: '2 awaiting approval', tone: 'gold' },
  { label: 'Active Bookings', value: '19', delta: '4 starting soon', tone: 'aurora' }
];

export const screenCards: Record<ScreenId, ScreenCard[]> = {
  dashboard: [
    { title: 'Overdue returns', description: 'Laptop AF-0114 is overdue by 2 days.', status: 'Critical' },
    { title: 'Pending transfers', description: 'Printer PR-2201 is waiting on approval.', status: 'Review' },
    { title: 'Maintenance queue', description: 'Vehicle AF-0041 is waiting for approval.', status: 'Pending' }
  ],
  organization: [
    { title: 'Departments', description: 'Hierarchy, heads, active / inactive state.', status: 'Admin only' },
    { title: 'Asset categories', description: 'Electronics, furniture, vehicles, and custom fields.', status: 'Master data' },
    { title: 'Employee directory', description: 'Promote employees to manager roles from here only.', status: 'Role control' }
  ],
  assets: [
    { title: 'Register asset', description: 'Asset tag, serial number, location, condition, documents.', status: 'Create' },
    { title: 'Search and filter', description: 'Tag, serial, QR code, category, status, department, location.', status: 'Locate' },
    { title: 'History trail', description: 'Allocation and maintenance history per asset.', status: 'Traceable' }
  ],
  allocations: [
    { title: 'Allocation guardrails', description: 'Blocks double-allocation and surfaces current holder.', status: 'Validated' },
    { title: 'Transfer workflow', description: 'Requested → Approved → Re-allocated.', status: 'Workflow' },
    { title: 'Return flow', description: 'Check-in notes and status revert to available.', status: 'Return' }
  ],
  bookings: [
    { title: 'Calendar booking', description: 'Overlap checks for rooms, vehicles, and shared equipment.', status: 'No conflicts' },
    { title: 'Booking states', description: 'Upcoming, ongoing, completed, cancelled.', status: 'Tracked' },
    { title: 'Reminders', description: 'Notifications before the slot starts.', status: 'Scheduled' }
  ],
  maintenance: [
    { title: 'Approval gate', description: 'Requests move Pending → Approved / Rejected before work starts.', status: 'Controlled' },
    { title: 'Asset state sync', description: 'Approved requests switch asset to Under Maintenance.', status: 'Automatic' },
    { title: 'Resolution history', description: 'Technician assignment and repair history retained.', status: 'Auditable' }
  ],
  audits: [
    { title: 'Audit cycles', description: 'Scope, auditors, and date range per cycle.', status: 'Scheduled' },
    { title: 'Finding capture', description: 'Verified, missing, and damaged asset flags.', status: 'Structured' },
    { title: 'Discrepancy report', description: 'Close cycle with locked results and status updates.', status: 'Finalized' }
  ],
  reports: [
    { title: 'Utilization trends', description: 'Most-used versus idle assets over time.', status: 'Analytics' },
    { title: 'Maintenance patterns', description: 'By asset and category.', status: 'Insights' },
    { title: 'Booking heatmap', description: 'Peak usage windows and resource demand.', status: 'Exports' }
  ],
  activity: [
    { title: 'Notifications', description: 'Assignments, approvals, reminders, overdue alerts.', status: 'Realtime' },
    { title: 'Audit log', description: 'Who did what, when, and on which record.', status: 'Immutable' },
    { title: 'Traceability', description: 'Cross-linked logs across asset lifecycle events.', status: 'Complete' }
  ]
};

export const alerts = [
  'Laptop AF-0114 is overdue for return by 2 days.',
  'Room B2 booking overlaps a requested slot and was blocked.',
  'Maintenance request for Vehicle AF-0041 is waiting for approval.'
];

export const activity: ActivityItem[] = [
  { action: 'Asset assigned', subject: 'AF-0114 to Priya Sharma', at: '10 min ago' },
  { action: 'Booking confirmed', subject: 'Conference Room B2, 2:00 PM - 3:00 PM', at: '28 min ago' },
  { action: 'Maintenance approved', subject: 'AC Unit AU-9002', at: '1 hour ago' },
  { action: 'Transfer requested', subject: 'Printer PR-2201 from Finance to Admin', at: '3 hours ago' }
];

export const workflow = [
  'Admin sets departments, categories, and role promotions.',
  'Asset Manager registers and allocates assets.',
  'Employees book shared resources or raise maintenance requests.',
  'Auditors verify cycles and discrepancy reports close the loop.'
];
