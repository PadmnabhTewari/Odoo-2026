export type ScreenId =
  | 'dashboard'
  | 'organization'
  | 'assets'
  | 'allocations'
  | 'bookings'
  | 'maintenance'
  | 'audits'
  | 'reports'
  | 'activity';

export type KpiCard = {
  label: string;
  value: string;
  delta: string;
  tone: 'aurora' | 'ember' | 'gold';
};

export type ActivityItem = {
  action: string;
  subject: string;
  at: string;
};

export type ScreenCard = {
  title: string;
  description: string;
  status: string;
};
