import type { Express, Request, Response } from 'express';
import { requireAuth, requireRoles } from '../middleware/authorize.js';

const reportCatalog = {
  Utilization: {
    title: 'Utilization',
    metrics: [
      { label: 'Total assets', value: 214 },
      { label: 'Allocated assets', value: 86 },
      { label: 'Available assets', value: 128 }
    ],
    chart: {
      variant: 'bar' as const,
      segments: [
        { label: 'Allocated', value: 86, color: '#5eead4' },
        { label: 'Available', value: 128, color: '#60a5fa' },
        { label: 'Maintenance', value: 12, color: '#fbbf24' }
      ]
    }
  },
  'Maintenance frequency': {
    title: 'Maintenance frequency',
    metrics: [
      { label: 'Open requests', value: 7 },
      { label: 'Resolved items', value: 24 },
      { label: 'High priority', value: 3 }
    ],
    chart: {
      variant: 'bar' as const,
      segments: [
        { label: 'Pending', value: 4, color: '#fb7185' },
        { label: 'Approved', value: 2, color: '#fbbf24' },
        { label: 'Resolved', value: 24, color: '#5eead4' }
      ]
    }
  },
  'Allocation summary': {
    title: 'Allocation summary',
    metrics: [
      { label: 'Approved', value: 52 },
      { label: 'Transferred', value: 8 },
      { label: 'Returned', value: 31 }
    ],
    chart: {
      variant: 'donut' as const,
      segments: [
        { label: 'Approved', value: 52, color: '#5eead4' },
        { label: 'Transferred', value: 8, color: '#60a5fa' },
        { label: 'Returned', value: 31, color: '#a78bfa' }
      ]
    }
  },
  'Booking heatmap': {
    title: 'Booking heatmap',
    metrics: [
      { label: 'Active bookings', value: 19 },
      { label: 'Cancelled', value: 4 },
      { label: 'Completed', value: 37 }
    ],
    chart: {
      variant: 'heatmap' as const,
      cells: [
        { label: 'Mon', intensity: 0.35 },
        { label: 'Tue', intensity: 0.55 },
        { label: 'Wed', intensity: 0.72 },
        { label: 'Thu', intensity: 0.68 },
        { label: 'Fri', intensity: 0.81 },
        { label: 'Sat', intensity: 0.22 },
        { label: 'Sun', intensity: 0.14 }
      ]
    }
  }
};

export function registerReportRoutes(app: Express) {
  app.post(
    '/api/reports/generate',
    requireAuth,
    requireRoles('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'),
    (request: Request, response: Response) => {
      const { reportType = 'Utilization', reportRange = 'Last 30 days' } = request.body as {
        reportType?: keyof typeof reportCatalog;
        reportRange?: string;
      };

      const report = reportCatalog[reportType] ?? reportCatalog.Utilization;

      response.json({
        title: report.title,
        generatedAt: new Date().toISOString(),
        reportRange,
        summary: `${report.title} report generated for ${reportRange}.`,
        metrics: report.metrics,
        chart: report.chart,
        generatedBy: request.employee?.name
      });
    }
  );
}
