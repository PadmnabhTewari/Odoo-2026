import type { Express, Request, Response } from 'express';
import { getAuthenticatedEmployee } from '../lib/auth.js';

const overview = {
  kpis: [
    { label: 'Assets Available', value: 214, delta: '+12' },
    { label: 'Assets Allocated', value: 86, delta: '+3' },
    { label: 'Maintenance Today', value: 7, delta: '2 pending approval' },
    { label: 'Active Bookings', value: 19, delta: '4 starting soon' },
    { label: 'Pending Transfers', value: 5, delta: '1 overdue' },
    { label: 'Upcoming Returns', value: 23, delta: '6 overdue' }
  ],
  alerts: [
    'Laptop AF-0114 is overdue for return by 2 days.',
    'Room B2 booking overlaps a requested time slot and was blocked.',
    'Maintenance request for Vehicle AF-0041 is waiting for approval.'
  ],
  activities: [
    { action: 'Asset assigned', subject: 'AF-0114 to Priya Sharma', at: '10 min ago' },
    { action: 'Booking confirmed', subject: 'Conference Room B2, 2:00 PM - 3:00 PM', at: '28 min ago' },
    { action: 'Maintenance approved', subject: 'AC Unit AU-9002', at: '1 hour ago' },
    { action: 'Transfer requested', subject: 'Printer PR-2201 from Finance to Admin', at: '3 hours ago' }
  ]
};

export function registerOverviewRoutes(app: Express) {
  app.get('/health', (_request: Request, response: Response) => {
    response.json({ ok: true, service: 'assetflow-server' });
  });

  app.get('/api/overview', async (request: Request, response: Response) => {
    const employee = await getAuthenticatedEmployee(request);
    if (!employee) {
      response.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    response.json({
      employee: {
        name: employee.name,
        role: employee.role,
        departmentId: employee.departmentId
      },
      ...overview
    });
  });

  app.get('/api/modules', async (request: Request, response: Response) => {
    const employee = await getAuthenticatedEmployee(request);
    if (!employee) {
      response.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    response.json([
      'Organization Setup',
      'Asset Registry',
      'Allocation & Transfers',
      'Resource Booking',
      'Maintenance Workflow',
      'Audit Cycles',
      'Reports & Analytics',
      'Activity Logs & Notifications'
    ]);
  });
}
