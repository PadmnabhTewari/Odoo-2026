import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GenericFeaturePage } from './pages/GenericFeaturePage';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<RequireRole screen="organization" />}>
            <Route path="/organization" element={<GenericFeaturePage screen="organization" />} />
          </Route>
          <Route element={<RequireRole screen="assets" />}>
            <Route path="/assets" element={<GenericFeaturePage screen="assets" />} />
          </Route>
          <Route element={<RequireRole screen="allocations" />}>
            <Route path="/allocations" element={<GenericFeaturePage screen="allocations" />} />
          </Route>
          <Route element={<RequireRole screen="bookings" />}>
            <Route path="/bookings" element={<GenericFeaturePage screen="bookings" />} />
          </Route>
          <Route element={<RequireRole screen="maintenance" />}>
            <Route path="/maintenance" element={<GenericFeaturePage screen="maintenance" />} />
          </Route>
          <Route element={<RequireRole screen="audits" />}>
            <Route path="/audits" element={<GenericFeaturePage screen="audits" />} />
          </Route>
          <Route element={<RequireRole screen="reports" />}>
            <Route path="/reports" element={<GenericFeaturePage screen="reports" />} />
          </Route>
          <Route element={<RequireRole screen="activity" />}>
            <Route path="/activity" element={<GenericFeaturePage screen="activity" />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
