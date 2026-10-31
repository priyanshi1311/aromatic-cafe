import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage from './pages/public/HomePage';
import BookingPage from './pages/public/BookingPage';
import BookingSuccess from './pages/public/BookingSuccess';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import BookingsPage from './pages/admin/BookingsPage';
import TablesPage from './pages/admin/TablesPage';
import CustomersPage from './pages/admin/CustomersPage';
import QRPage from './pages/admin/QRPage';
import SettingsPage from './pages/admin/SettingsPage';
import AdminLayout from './components/AdminLayout';

// Protect admin routes – redirects unauthenticated users to login
const AdminProtected = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
              fontSize: '13px',
              fontWeight: 500,
            },
          }}
        />
        <Routes>
          {/* Public customer routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/success/:bookingId" element={<BookingSuccess />} />

          {/* Admin login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected admin area with nested routes */}
          <Route
            path="/admin"
            element={
              <AdminProtected>
                <AdminLayout />
              </AdminProtected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="qr" element={<QRPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
