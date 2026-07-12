import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GenericFeaturePage } from './pages/GenericFeaturePage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/organization" element={<GenericFeaturePage screen="organization" />} />
        <Route path="/assets" element={<GenericFeaturePage screen="assets" />} />
        <Route path="/allocations" element={<GenericFeaturePage screen="allocations" />} />
        <Route path="/bookings" element={<GenericFeaturePage screen="bookings" />} />
        <Route path="/maintenance" element={<GenericFeaturePage screen="maintenance" />} />
        <Route path="/audits" element={<GenericFeaturePage screen="audits" />} />
        <Route path="/reports" element={<GenericFeaturePage screen="reports" />} />
        <Route path="/activity" element={<GenericFeaturePage screen="activity" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
