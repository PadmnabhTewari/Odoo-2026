import { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { InfoCard } from '../components/InfoCard';
import type { ScreenId } from '../types/assetflow';
import { screenCards } from '../data/assetflow';
import { getStoredEmployee } from '../lib/session';
import { getRolePermissions } from '../lib/roles';
import { apiRequest } from '../lib/api';
import { BookingHeatmap, ReportChart } from '../components/ReportChart';
import { formatDateTime, overlaps } from '../utils/date';

type OrganizationTab = 'departments' | 'categories' | 'employees';

type Department = { name: string; code: string; head: string; status: 'Active' | 'Inactive'; parent: string };
type Category = { name: string; field: string; status: 'Active' | 'Inactive' };
type Employee = { name: string; email: string; department: string; role: string; status: 'Active' | 'Inactive' };
type Asset = { tag: string; name: string; category: string; holder: string; status: string; location: string; shared: boolean };
type Allocation = { asset: string; recipient: string; expectedReturn: string; status: 'Requested' | 'Approved' | 'Transferred' | 'Returned' };
type Booking = { resource: string; startAt: string; endAt: string; bookedBy: string; status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled' };
type Maintenance = { asset: string; issue: string; priority: 'Low' | 'Medium' | 'High'; status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Resolved'; requestedBy: string };
type AuditFinding = { asset: string; finding: 'Verified' | 'Missing' | 'Damaged'; note: string };
type Notification = { title: string; detail: string; channel: string; read: boolean };
type ReportChartData = {
  variant: 'bar' | 'donut' | 'heatmap';
  segments?: { label: string; value: number; color: string }[];
  cells?: { label: string; intensity: number }[];
};

type ReportSnapshot = {
  title: string;
  generatedAt: string;
  summary: string;
  metrics: { label: string; value: string }[];
  highlights: string[];
  chart?: ReportChartData;
};

const screenMeta: Record<Exclude<ScreenId, 'dashboard'>, { title: string; subtitle: string; badge: string }> = {
  organization: {
    title: 'Organization Setup',
    subtitle: 'Create departments, categories, and employees, then promote roles from the directory.',
    badge: 'Admin only'
  },
  assets: {
    title: 'Asset Registration & Directory',
    subtitle: 'Register assets, search them, and manage lifecycle and shared-bookable state.',
    badge: 'Asset registry'
  },
  allocations: {
    title: 'Asset Allocation & Transfer',
    subtitle: 'Block double allocation, create transfers, and process returns with condition notes.',
    badge: 'Allocation workflow'
  },
  bookings: {
    title: 'Resource Booking',
    subtitle: 'Book shared rooms and equipment with overlap validation and rescheduling support.',
    badge: 'Time slots'
  },
  maintenance: {
    title: 'Maintenance Management',
    subtitle: 'Approve or reject maintenance before work starts, then resolve and return assets.',
    badge: 'Approval flow'
  },
  audits: {
    title: 'Asset Audit',
    subtitle: 'Create audit cycles, capture findings, and close cycles with discrepancy handling.',
    badge: 'Audit cycle'
  },
  reports: {
    title: 'Reports & Analytics',
    subtitle: 'Generate utilization, maintenance, allocation, and booking insights from the same workspace.',
    badge: 'Analytics'
  },
  activity: {
    title: 'Activity Logs & Notifications',
    subtitle: 'Filter notifications and mark updates as read across the operational log.',
    badge: 'Traceability'
  }
};

const initialDepartments: Department[] = [
  { name: 'Engineering', code: 'ENG', head: 'A. Kumar', status: 'Active', parent: 'Corporate' },
  { name: 'Finance', code: 'FIN', head: 'S. Patel', status: 'Active', parent: 'Corporate' },
  { name: 'Facilities', code: 'FAC', head: 'N. Roy', status: 'Active', parent: 'Operations' }
];

const initialCategories: Category[] = [
  { name: 'Electronics', field: 'Warranty period', status: 'Active' },
  { name: 'Furniture', field: 'Condition rating', status: 'Active' },
  { name: 'Vehicles', field: 'Service interval', status: 'Active' }
];

const initialEmployees: Employee[] = [
  { name: 'Priya Sharma', email: 'priya@company.com', department: 'Engineering', role: 'Employee', status: 'Active' },
  { name: 'Raj Mehta', email: 'raj@company.com', department: 'Finance', role: 'Department Head', status: 'Active' },
  { name: 'Nisha Roy', email: 'nisha@company.com', department: 'Facilities', role: 'Asset Manager', status: 'Active' }
];

const initialAssets: Asset[] = [
  { tag: 'AF-0114', name: 'Laptop Pro 14', category: 'Electronics', holder: 'Priya Sharma', status: 'Allocated', location: 'HQ-2F', shared: false },
  { tag: 'AF-0041', name: 'Utility Vehicle', category: 'Vehicles', holder: 'Workshop', status: 'Under Maintenance', location: 'Yard', shared: false },
  { tag: 'AF-2210', name: 'Room B2 Projector', category: 'Electronics', holder: 'Pool', status: 'Available', location: 'Room B2', shared: true }
];

const initialAllocations: Allocation[] = [
  { asset: 'AF-0114', recipient: 'Priya Sharma', expectedReturn: '2026-07-18', status: 'Approved' },
  { asset: 'AF-2210', recipient: 'Marketing Team', expectedReturn: '2026-07-12', status: 'Returned' }
];

const initialBookings: Booking[] = [
  { resource: 'Room B2', startAt: '2026-07-12T09:00', endAt: '2026-07-12T10:00', bookedBy: 'Facilities', status: 'Upcoming' },
  { resource: 'Van 03', startAt: '2026-07-12T11:30', endAt: '2026-07-12T13:00', bookedBy: 'Operations', status: 'Upcoming' }
];

const initialMaintenance: Maintenance[] = [
  { asset: 'AF-0041', issue: 'Oil leak from rear side', priority: 'High', status: 'Pending', requestedBy: 'Facilities' },
  { asset: 'PR-2201', issue: 'Paper jam and roller wear', priority: 'Medium', status: 'Approved', requestedBy: 'Finance' }
];

const initialAuditFindings: AuditFinding[] = [
  { asset: 'AF-0114', finding: 'Verified', note: 'Tagged and present in Engineering' },
  { asset: 'AF-3301', finding: 'Missing', note: 'Not found at assigned location' }
];

const initialNotifications: Notification[] = [
  { title: 'Asset assigned', detail: 'AF-0114 assigned to Priya Sharma', channel: 'In-app', read: false },
  { title: 'Booking reminder', detail: 'Room B2 booking starts in 30 minutes', channel: 'Email', read: false },
  { title: 'Audit discrepancy', detail: 'Missing asset flagged in Warehouse scope', channel: 'SMS', read: true }
];

export function GenericFeaturePage({ screen }: { screen: Exclude<ScreenId, 'dashboard'> }) {
  const meta = screenMeta[screen];
  const cards = screenCards[screen];
  const employee = getStoredEmployee();
  const {
    canManageOrganization,
    canManageAssets,
    canManageAllocations,
    canManageAudits,
    canGenerateReports,
    canApproveMaintenance
  } = getRolePermissions(employee?.role);

  const [organizationTab, setOrganizationTab] = useState<OrganizationTab>('departments');
  const [departments, setDepartments] = useState(initialDepartments);
  const [categories, setCategories] = useState(initialCategories);
  const [employees, setEmployees] = useState(initialEmployees);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentHead, setDepartmentHead] = useState('');
  const [departmentParent, setDepartmentParent] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryField, setCategoryField] = useState('');
  const [organizationMessage, setOrganizationMessage] = useState('');

  const [assetSearch, setAssetSearch] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] = useState('All');
  const [assets, setAssets] = useState(initialAssets);
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetHolder, setAssetHolder] = useState('');
  const [assetShared, setAssetShared] = useState(false);
  const [assetMessage, setAssetMessage] = useState('');

  const [allocationAsset, setAllocationAsset] = useState('AF-0114');
  const [allocationRecipient, setAllocationRecipient] = useState('');
  const [allocationReturn, setAllocationReturn] = useState('');
  const [allocationMessage, setAllocationMessage] = useState('');
  const [allocations, setAllocations] = useState(initialAllocations);

  const [bookingResource, setBookingResource] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingOwner, setBookingOwner] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookings, setBookings] = useState(initialBookings);

  const [maintenanceAsset, setMaintenanceAsset] = useState('');
  const [maintenanceIssue, setMaintenanceIssue] = useState('');
  const [maintenancePriority, setMaintenancePriority] = useState<Maintenance['priority']>('High');
  const [maintenances, setMaintenances] = useState(initialMaintenance);

  const [auditTitle, setAuditTitle] = useState('');
  const [auditScope, setAuditScope] = useState('');
  const [auditAsset, setAuditAsset] = useState('');
  const [auditNote, setAuditNote] = useState('');
  const [auditFindings, setAuditFindings] = useState(initialAuditFindings);
  const [auditMessage, setAuditMessage] = useState('');

  const [reportType, setReportType] = useState('Utilization');
  const [reportRange, setReportRange] = useState('Last 30 days');
  const [reportSnapshot, setReportSnapshot] = useState<ReportSnapshot>({
    title: 'Utilization',
    generatedAt: formatDateTime(new Date().toISOString()),
    summary: 'Select a report type and range, then click Generate report.',
    metrics: [],
    highlights: []
  });
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [reportError, setReportError] = useState('');

  const [notificationFilter, setNotificationFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [notifications, setNotifications] = useState(initialNotifications);

  const actionLabel =
    screen === 'organization'
      ? 'Create department'
      : screen === 'assets'
        ? 'Register asset'
        : screen === 'allocations'
          ? 'Allocate asset'
          : screen === 'bookings'
            ? 'Book resource'
            : screen === 'maintenance'
              ? 'Raise request'
              : screen === 'audits'
                ? 'Create cycle'
                : screen === 'reports'
                  ? 'Generate report'
                  : 'Filter notifications';

  const filteredAssets = assets.filter((asset) => {
    const query = assetSearch.toLowerCase();
    const matchesQuery =
      asset.tag.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query) ||
      asset.category.toLowerCase().includes(query) ||
      asset.location.toLowerCase().includes(query);
    const matchesStatus = assetStatusFilter === 'All' || asset.status === assetStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const addDepartment = () => {
    const name = departmentName.trim();
    const code = departmentCode.trim().toUpperCase();
    if (!name || !code) {
      setOrganizationMessage('Enter a department name and a unique code.');
      return;
    }
    if (departments.some((department) => department.code.toLowerCase() === code.toLowerCase() || department.name.toLowerCase() === name.toLowerCase())) {
      setOrganizationMessage('That department name or code already exists.');
      return;
    }
    setDepartments((current) => [...current, { name, code, head: departmentHead.trim(), status: 'Active', parent: departmentParent.trim() }]);
    setDepartmentName(''); setDepartmentCode(''); setDepartmentHead(''); setDepartmentParent('');
    setOrganizationMessage(`${name} was added to the organization.`);
  };

  const addCategory = () => {
    const name = categoryName.trim();
    const field = categoryField.trim();
    if (!name || !field) {
      setOrganizationMessage('Enter a category name and the field it should track.');
      return;
    }
    if (categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      setOrganizationMessage('That category already exists.');
      return;
    }
    setCategories((current) => [...current, { name, field, status: 'Active' }]);
    setCategoryName(''); setCategoryField('');
    setOrganizationMessage(`${name} was added to the asset catalog.`);
  };

  const promoteEmployee = (email: string, role: string) => {
    setEmployees((current) => current.map((employee) => (employee.email === email ? { ...employee, role } : employee)));
  };

  const addAsset = () => {
    const tag = assetTag.trim().toUpperCase();
    const name = assetName.trim();
    const category = assetCategory.trim();
    const location = assetLocation.trim();
    const holder = assetHolder.trim();
    if (!tag || !name || !category || !location || !holder) {
      setAssetMessage('Enter a tag, name, category, location, and current holder before registering an asset.');
      return;
    }
    if (assets.some((asset) => asset.tag.toLowerCase() === tag.toLowerCase())) {
      setAssetMessage(`Asset tag ${tag} is already in use.`);
      return;
    }
    setAssets((current) => [
      { tag, name, category, holder, status: 'Available', location, shared: assetShared },
      ...current
    ]);
    setAssetTag(''); setAssetName(''); setAssetCategory(''); setAssetLocation(''); setAssetHolder(''); setAssetShared(false);
    setAssetMessage(`${tag} was registered and is now available.`);
  };

  const toggleShared = (tag: string) => {
    setAssets((current) => current.map((asset) => (asset.tag === tag ? { ...asset, shared: !asset.shared } : asset)));
  };

  const allocateAsset = () => {
    const target = assets.find((asset) => asset.tag === allocationAsset);
    if (!target) {
      setAllocationMessage('Select a valid asset.');
      return;
    }
    if (!allocationRecipient.trim() || !allocationReturn) {
      setAllocationMessage('Enter a recipient and expected return date.');
      return;
    }
    if (target.status === 'Allocated') {
      setAllocationMessage(`${target.tag} is currently held by ${target.holder}. Create a transfer request instead.`);
      return;
    }
    setAllocationMessage(`${target.tag} allocated to ${allocationRecipient}.`);
    setAssets((current) => current.map((asset) => (asset.tag === allocationAsset ? { ...asset, status: 'Allocated', holder: allocationRecipient } : asset)));
    setAllocations((current) => [...current, { asset: allocationAsset, recipient: allocationRecipient, expectedReturn: allocationReturn, status: 'Approved' }]);
  };

  const transferAsset = (tag: string) => {
    setAllocationMessage(`${tag} transfer request created and queued for approval.`);
    setAllocations((current) => current.map((allocation) => (allocation.asset === tag ? { ...allocation, status: 'Transferred' } : allocation)));
  };

  const returnAsset = (tag: string) => {
    setAssets((current) => current.map((asset) => (asset.tag === tag ? { ...asset, status: 'Available', holder: 'Pool' } : asset)));
    setAllocationMessage(`${tag} marked as returned and available.`);
    setAllocations((current) => current.map((allocation) => (allocation.asset === tag ? { ...allocation, status: 'Returned' } : allocation)));
  };

  const createBooking = () => {
    if (!bookingResource.trim() || !bookingOwner.trim() || !bookingStart || !bookingEnd || !bookingPurpose.trim()) {
      setBookingMessage('Complete the resource, owner, time range, and purpose before booking.');
      return;
    }
    if (new Date(bookingEnd).getTime() <= new Date(bookingStart).getTime()) {
      setBookingMessage('The end time must be after the start time.');
      return;
    }
    const conflict = bookings.find((booking) => booking.resource === bookingResource && overlaps(booking.startAt, booking.endAt, bookingStart, bookingEnd));
    if (conflict) {
      setBookingMessage(`Overlap blocked with ${conflict.resource} from ${formatDateTime(conflict.startAt)} to ${formatDateTime(conflict.endAt)}.`);
      return;
    }
    setBookings((current) => [
      { resource: bookingResource, startAt: bookingStart, endAt: bookingEnd, bookedBy: bookingOwner, status: 'Upcoming' },
      ...current
    ]);
    setBookingMessage(`Booking created for ${bookingResource}.`);
    setBookingResource(''); setBookingOwner(''); setBookingStart(''); setBookingEnd(''); setBookingPurpose('');
  };

  const updateBookingStatus = (index: number, status: Booking['status']) => {
    setBookings((current) => current.map((booking, bookingIndex) => (bookingIndex === index ? { ...booking, status } : booking)));
  };

  const submitMaintenance = () => {
    if (!maintenanceAsset || !maintenanceIssue.trim()) return;
    setMaintenances((current) => [{ asset: maintenanceAsset, issue: maintenanceIssue.trim(), priority: maintenancePriority, status: 'Pending', requestedBy: employee?.name || 'Employee' }, ...current]);
    setMaintenanceAsset('');
    setMaintenanceIssue('');
  };

  const updateMaintenance = (index: number, status: Maintenance['status']) => {
    setMaintenances((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, status } : item)));
  };

  const addAuditFinding = (finding: AuditFinding['finding']) => {
    if (!auditTitle.trim() || !auditScope.trim() || !auditAsset.trim() || !auditNote.trim()) {
      setAuditMessage('Enter the audit, scope, asset tag, and observation before recording a finding.');
      return;
    }
    setAuditFindings((current) => [{ asset: auditAsset.trim(), finding, note: auditNote.trim() }, ...current]);
    setAuditAsset(''); setAuditNote('');
    setAuditMessage(`${finding} recorded for ${auditTitle}.`);
  };

  const closeAudit = () => {
    if (!canManageAudits) return;
    setAuditMessage(`${auditTitle} closed for ${auditScope}.`);
  };

  const generateReport = async () => {
    if (!canGenerateReports) {
      setReportError('You do not have permission to generate reports.');
      return;
    }

    setReportStatus('loading');
    setReportError('');

    try {
      const result = await apiRequest<{
        title: string;
        generatedAt: string;
        reportRange: string;
        summary: string;
        metrics: { label: string; value: number }[];
        chart: ReportChartData;
        generatedBy?: string;
      }>('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ reportType, reportRange })
      });

      const totalAssets = assets.length;
      const allocatedAssets = assets.filter((asset) => asset.status === 'Allocated').length;
      const maintenanceQueue = maintenances.filter((item) => item.status === 'Pending' || item.status === 'Approved' || item.status === 'In Progress').length;
      const activeBookings = bookings.filter((booking) => booking.status === 'Upcoming' || booking.status === 'Ongoing').length;
      const openAllocations = allocations.filter((allocation) => allocation.status !== 'Returned').length;

      const localHighlights: Record<string, string[]> = {
        Utilization: [
          `${allocatedAssets} assets are in active use.`,
          `${openAllocations} allocations still need follow-up.`,
          `${activeBookings} bookings are upcoming or ongoing.`
        ],
        'Maintenance frequency': [
          `${maintenances.filter((item) => item.priority === 'High').length} high-priority requests remain in the queue.`,
          `${maintenances.filter((item) => item.status === 'Resolved').length} issues were resolved.`,
          `${assets.filter((asset) => asset.status === 'Under Maintenance').length} assets are currently offline.`
        ],
        'Allocation summary': [
          `${allocations.filter((allocation) => allocation.status === 'Approved').length} allocations are approved.`,
          `${allocations.filter((allocation) => allocation.status === 'Transferred').length} transfers are in motion.`,
          `${assets.filter((asset) => asset.status === 'Allocated').length} assets are physically allocated.`
        ],
        'Booking heatmap': [
          `${bookings.filter((booking) => booking.resource === 'Room B2').length} entries are tied to Room B2.`,
          `${bookings.filter((booking) => booking.resource !== 'Room B2').length} entries are on other shared resources.`,
          `${activeBookings} slots still need attention.`
        ]
      };

      setReportSnapshot({
        title: result.title,
        generatedAt: formatDateTime(result.generatedAt),
        summary: result.summary,
        metrics: result.metrics.map((metric) => ({ label: metric.label, value: String(metric.value) })),
        highlights: localHighlights[reportType] ?? localHighlights.Utilization,
        chart: result.chart
      });
      setReportStatus('ready');
    } catch (caughtError) {
      setReportStatus('error');
      setReportError(caughtError instanceof Error ? caughtError.message : 'Failed to generate report.');
    }
  };

  const visibleNotifications = notifications.filter((notification) => {
    if (notificationFilter === 'All') return true;
    if (notificationFilter === 'Unread') return !notification.read;
    return notification.read;
  });

  const markNotificationRead = (title: string) => {
    setNotifications((current) => current.map((notification) => (notification.title === title ? { ...notification, read: true } : notification)));
  };

  return (
    <>
      <PageHero title={meta.title} subtitle={meta.subtitle} badge={meta.badge} />

      <section className="grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </section>

      {screen === 'organization' && (
        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="flex gap-2">
              {(['departments', 'categories', 'employees'] as OrganizationTab[]).map((tab) => (
                <button key={tab} onClick={() => setOrganizationTab(tab)} className={`rounded-full px-4 py-2 text-sm ${organizationTab === tab ? 'bg-aurora/20 text-aurora' : 'bg-ink-800/80 text-slate-300'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {organizationTab === 'departments' && (
                <>
                  {canManageOrganization && (
                    <div className="rounded-2xl border border-aurora/20 bg-aurora/[0.06] p-3">
                      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-aurora">New department</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} placeholder="Department name" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                        <input value={departmentCode} onChange={(event) => setDepartmentCode(event.target.value)} placeholder="Unique code (e.g. OPS)" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                        <input value={departmentHead} onChange={(event) => setDepartmentHead(event.target.value)} placeholder="Department head (optional)" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                        <input value={departmentParent} onChange={(event) => setDepartmentParent(event.target.value)} placeholder="Parent department (optional)" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                      </div>
                      <button onClick={addDepartment} className="mt-3 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">Create department</button>
                    </div>
                  )}
                  {departments.map((department) => (
                    <div key={department.code} className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{department.name}</div>
                          <div className="text-slate-400">{department.code} • Head: {department.head}</div>
                        </div>
                        <span className="rounded-full border border-aurora/20 px-3 py-1 text-xs text-aurora">{department.status}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {organizationTab === 'categories' && (
                <>
                  {canManageOrganization && (
                    <div className="rounded-2xl border border-aurora/20 bg-aurora/[0.06] p-3">
                      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-aurora">New category</p>
                      <div className="grid gap-2 sm:grid-cols-2"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" /><input value={categoryField} onChange={(event) => setCategoryField(event.target.value)} placeholder="Field to track (e.g. Warranty)" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" /></div>
                      <button onClick={addCategory} className="mt-3 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">Add category</button>
                    </div>
                  )}
                  {categories.map((category) => (
                    <div key={category.name} className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
                      <div className="font-medium text-white">{category.name}</div>
                      <div className="text-slate-400">{category.field}</div>
                    </div>
                  ))}
                </>
              )}

              {organizationTab === 'employees' && (
                <>
                  {employees.map((employee) => (
                    <div key={employee.email} className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-white">{employee.name}</div>
                          <div className="text-slate-400">{employee.email} • {employee.department}</div>
                        </div>
                        {canManageOrganization && (
                          <div className="flex gap-2">
                            <button onClick={() => promoteEmployee(employee.email, 'Department Head')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Head</button>
                            <button onClick={() => promoteEmployee(employee.email, 'Asset Manager')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Manager</button>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-aurora">{employee.role}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {organizationMessage && <p className="mt-4 rounded-xl border border-aurora/20 bg-aurora/[0.06] px-3 py-2 text-sm text-aurora">{organizationMessage}</p>}
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Administration table</h3>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2">Entity</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.code} className="border-t border-white/10">
                    <td className="py-3 text-white">{department.name}</td>
                    <td className="py-3 text-aurora">{department.status}</td>
                    <td className="py-3 text-slate-400">Head {department.head} / Parent {department.parent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      )}

      {screen === 'assets' && (
        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} placeholder="Search assets" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <select value={assetStatusFilter} onChange={(event) => setAssetStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                <option>All</option>
                <option>Available</option>
                <option>Allocated</option>
                <option>Under Maintenance</option>
              </select>
            </div>
            {canManageAssets && (
              <div className="mt-4 rounded-2xl border border-aurora/20 bg-aurora/[0.06] p-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-aurora">Register a new asset</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <input value={assetTag} onChange={(event) => setAssetTag(event.target.value)} placeholder="Unique asset tag" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                  <input value={assetName} onChange={(event) => setAssetName(event.target.value)} placeholder="Asset name" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                  <input value={assetCategory} onChange={(event) => setAssetCategory(event.target.value)} placeholder="Category" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                  <input value={assetLocation} onChange={(event) => setAssetLocation(event.target.value)} placeholder="Location" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2" />
                  <input value={assetHolder} onChange={(event) => setAssetHolder(event.target.value)} placeholder="Current holder or pool" className="rounded-xl border border-white/10 bg-ink-800/80 px-3 py-2 md:col-span-2" />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-300"><input checked={assetShared} onChange={(event) => setAssetShared(event.target.checked)} type="checkbox" className="h-4 w-4 accent-[#47d7ac]" /> Available for shared bookings</label>
                <button onClick={addAsset} className="mt-3 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">Register asset</button>
              </div>
            )}
            {assetMessage && <p className="mt-3 text-sm text-aurora">{assetMessage}</p>}
            <div className="mt-4 space-y-3">
              {filteredAssets.map((asset) => (
                <div key={asset.tag} className="rounded-2xl border border-white/10 bg-ink-800/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{asset.tag} • {asset.name}</div>
                      <div className="text-slate-400">{asset.category} • {asset.location} • Holder: {asset.holder}</div>
                    </div>
                    {canManageAssets && (
                      <button onClick={() => toggleShared(asset.tag)} className="rounded-full border border-white/10 px-3 py-1 text-xs">{asset.shared ? 'Shared' : 'Private'}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Asset history</h3>
            <div className="mt-4 space-y-3">
              {filteredAssets.map((asset) => (
                <div key={asset.tag + '-history'} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-medium text-white">{asset.tag}</div>
                  <div className="mt-1 text-sm text-slate-400">Lifecycle status: {asset.status}</div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {screen === 'allocations' && (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <select value={allocationAsset} onChange={(event) => setAllocationAsset(event.target.value)} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                {assets.map((asset) => <option key={asset.tag}>{asset.tag}</option>)}
              </select>
              <input value={allocationRecipient} onChange={(event) => setAllocationRecipient(event.target.value)} placeholder="Employee or department" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={allocationReturn} onChange={(event) => setAllocationReturn(event.target.value)} type="date" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
            </div>
            {canManageAllocations && (
              <div className="mt-4 flex gap-3">
                <button onClick={allocateAsset} className="rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">{actionLabel}</button>
                <button onClick={() => transferAsset(allocationAsset)} className="rounded-xl border border-white/10 px-4 py-2 text-white">Create transfer</button>
                <button onClick={() => returnAsset(allocationAsset)} className="rounded-xl border border-white/10 px-4 py-2 text-white">Mark returned</button>
              </div>
            )}
            <p className="mt-4 text-sm text-slate-300">{allocationMessage || 'Double allocation is blocked automatically and transfer requests are routed instead.'}</p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Current allocations</h3>
            <div className="mt-4 space-y-3">
              {allocations.map((allocation) => (
                <div key={allocation.asset + allocation.recipient} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{allocation.asset}</div>
                      <div className="text-slate-400">{allocation.recipient} • Expected return {allocation.expectedReturn}</div>
                    </div>
                    <span className="text-aurora text-xs uppercase tracking-[0.2em]">{allocation.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {screen === 'bookings' && (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={bookingResource} onChange={(event) => setBookingResource(event.target.value)} placeholder="Resource" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={bookingOwner} onChange={(event) => setBookingOwner(event.target.value)} placeholder="Booked by" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={bookingStart} onChange={(event) => setBookingStart(event.target.value)} type="datetime-local" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={bookingEnd} onChange={(event) => setBookingEnd(event.target.value)} type="datetime-local" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={bookingPurpose} onChange={(event) => setBookingPurpose(event.target.value)} placeholder="Purpose" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 md:col-span-2" />
            </div>
            <button onClick={createBooking} className="mt-4 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">{actionLabel}</button>
            <p className="mt-4 text-sm text-slate-300">{bookingMessage || 'The booking validator blocks overlapping time ranges for the same resource.'}</p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Calendar bookings</h3>
            <div className="mt-4 space-y-3">
              {bookings.map((booking, index) => (
                <div key={booking.resource + booking.startAt} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{booking.resource}</div>
                      <div className="text-slate-400">{formatDateTime(booking.startAt)} → {formatDateTime(booking.endAt)}</div>
                    </div>
                    <span className="text-aurora text-xs uppercase tracking-[0.2em]">{booking.status}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateBookingStatus(index, 'Completed')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Complete</button>
                    <button onClick={() => updateBookingStatus(index, 'Cancelled')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {screen === 'maintenance' && (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <select value={maintenanceAsset} onChange={(event) => setMaintenanceAsset(event.target.value)} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                <option value="">Select an asset</option>
                {assets.map((asset) => <option key={asset.tag}>{asset.tag}</option>)}
              </select>
              <select value={maintenancePriority} onChange={(event) => setMaintenancePriority(event.target.value as Maintenance['priority'])} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <textarea value={maintenanceIssue} onChange={(event) => setMaintenanceIssue(event.target.value)} placeholder="Describe the issue" className="min-h-28 rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 md:col-span-2" />
            </div>
            <button onClick={submitMaintenance} className="mt-4 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora">{actionLabel}</button>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Maintenance workflow</h3>
            <div className="mt-4 space-y-3">
              {maintenances.map((maintenance, index) => (
                <div key={maintenance.asset + maintenance.issue} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{maintenance.asset}</div>
                      <div className="text-slate-400">{maintenance.issue}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{maintenance.priority}</div>
                    </div>
                    <span className="text-aurora text-xs uppercase tracking-[0.2em]">{maintenance.status}</span>
                  </div>
                  {canApproveMaintenance && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => updateMaintenance(index, 'Approved')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Approve</button>
                      <button onClick={() => updateMaintenance(index, 'Rejected')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Reject</button>
                      <button onClick={() => updateMaintenance(index, 'Resolved')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Resolve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {screen === 'audits' && (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={auditTitle} onChange={(event) => setAuditTitle(event.target.value)} placeholder="Audit title" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={auditScope} onChange={(event) => setAuditScope(event.target.value)} placeholder="Scope" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={auditAsset} onChange={(event) => setAuditAsset(event.target.value)} placeholder="Asset tag" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
              <input value={auditNote} onChange={(event) => setAuditNote(event.target.value)} placeholder="Observation / note" className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {canManageAudits && (
                <>
                  <button onClick={() => addAuditFinding('Verified')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Verified</button>
                  <button onClick={() => addAuditFinding('Missing')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Missing</button>
                  <button onClick={() => addAuditFinding('Damaged')} className="rounded-full border border-white/10 px-3 py-1 text-xs">Damaged</button>
                  <button onClick={closeAudit} className="rounded-full border border-aurora/30 bg-aurora/10 px-3 py-1 text-xs text-aurora">Close cycle</button>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-300">{auditMessage || 'Create a cycle, assign auditors, and record verified, missing, or damaged findings.'}</p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <h3 className="text-xl font-semibold text-white">Audit findings</h3>
            <div className="mt-4 space-y-3">
              {auditFindings.map((finding) => (
                <div key={finding.asset + finding.note} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{finding.asset}</div>
                      <div className="text-slate-400">{finding.note}</div>
                    </div>
                    <span className="text-aurora text-xs uppercase tracking-[0.2em]">{finding.finding}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {screen === 'reports' && (
        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                <option>Utilization</option>
                <option>Maintenance frequency</option>
                <option>Allocation summary</option>
                <option>Booking heatmap</option>
              </select>
              <select value={reportRange} onChange={(event) => setReportRange(event.target.value)} className="rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Quarter to date</option>
              </select>
            </div>
            <button
              onClick={generateReport}
              disabled={reportStatus === 'loading' || !canGenerateReports}
              className="mt-4 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2 text-aurora disabled:opacity-60"
            >
              {reportStatus === 'loading' ? 'Generating...' : actionLabel}
            </button>
            {reportError && <p className="mt-4 text-sm text-ember">{reportError}</p>}
            <p className="mt-4 text-sm text-slate-300">{reportSnapshot.summary}</p>
            {reportStatus === 'ready' && reportSnapshot.chart?.variant === 'heatmap' && reportSnapshot.chart.cells && (
              <div className="mt-4">
                <BookingHeatmap title={`${reportSnapshot.title} load by day`} cells={reportSnapshot.chart.cells} />
              </div>
            )}
            {reportStatus === 'ready' && reportSnapshot.chart && reportSnapshot.chart.variant !== 'heatmap' && reportSnapshot.chart.segments && (
              <div className="mt-4">
                <ReportChart
                  title={`${reportSnapshot.title} breakdown`}
                  segments={reportSnapshot.chart.segments}
                  variant={reportSnapshot.chart.variant}
                />
              </div>
            )}
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">Report summary</h3>
              {reportStatus === 'ready' && (
                <span className="rounded-full border border-aurora/30 bg-aurora/10 px-3 py-1 text-xs text-aurora">
                  Generated {reportSnapshot.generatedAt}
                </span>
              )}
            </div>

            {reportStatus === 'ready' && reportSnapshot.metrics.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {reportSnapshot.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{metric.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {cards.map((card) => (
                  <InfoCard key={card.title} {...card} />
                ))}
              </div>
            )}

            {reportStatus === 'ready' && reportSnapshot.highlights.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm font-medium text-white">Key highlights</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {reportSnapshot.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-xl border border-white/8 bg-ink-800/60 px-4 py-3">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </section>
      )}

      {screen === 'activity' && (
        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
            <div className="flex gap-2">
              {(['All', 'Unread', 'Read'] as const).map((filter) => (
                <button key={filter} onClick={() => setNotificationFilter(filter)} className={`rounded-full px-4 py-2 text-sm ${notificationFilter === filter ? 'bg-aurora/20 text-aurora' : 'bg-ink-800/80 text-slate-300'}`}>
                  {filter}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">{actionLabel} by switching the filter chips and marking items as read.</p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-ink-900/80 p-6 shadow-glow">
            <div className="space-y-3">
              {visibleNotifications.map((notification) => (
                <div key={notification.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-white">{notification.title}</div>
                      <div className="text-slate-400">{notification.detail}</div>
                    </div>
                    <span className="text-aurora text-xs uppercase tracking-[0.2em]">{notification.channel}{notification.read ? ' · read' : ''}</span>
                  </div>
                  {!notification.read && (
                    <button onClick={() => markNotificationRead(notification.title)} className="mt-3 rounded-full border border-white/10 px-3 py-1 text-xs">Mark read</button>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </>
  );
}
