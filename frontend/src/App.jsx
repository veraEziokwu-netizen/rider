import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'

// Public pages
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'

// Shared pages
import Notifications from './pages/Notifications'
import Profile       from './pages/Profile'

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard'
import RequestDelivery   from './pages/customer/RequestDelivery'
import TrackDelivery     from './pages/customer/TrackDelivery'

// Rider pages
import RiderDashboard  from './pages/rider/Dashboard'
import RiderJobs       from './pages/rider/Jobs'
import ActiveDelivery  from './pages/rider/ActiveDelivery'

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard'
import AdminDeliveries from './pages/admin/Deliveries'
import AdminRiders     from './pages/admin/Riders'
import AdminUsers      from './pages/admin/Users'

// Smart redirect after login
function DashboardRedirect() {
  const { user } = useAuth()
  return <Navigate to="/app/dashboard" replace />
}

// Role-aware dashboard
function RoleDashboard() {
  const { user } = useAuth()
  if (user?.role === 'rider') return <RiderDashboard />
  if (user?.role === 'admin') return <AdminDashboard />
  return <CustomerDashboard />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected app shell */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<RoleDashboard />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />

                {/* Customer */}
                <Route path="request" element={<ProtectedRoute roles={['customer']}><RequestDelivery /></ProtectedRoute>} />
                <Route path="track"   element={<ProtectedRoute roles={['customer']}><TrackDelivery /></ProtectedRoute>} />

                {/* Rider */}
                <Route path="jobs"   element={<ProtectedRoute roles={['rider']}><RiderJobs /></ProtectedRoute>} />
                <Route path="active" element={<ProtectedRoute roles={['rider']}><ActiveDelivery /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="deliveries" element={<ProtectedRoute roles={['admin']}><AdminDeliveries /></ProtectedRoute>} />
                <Route path="riders"     element={<ProtectedRoute roles={['admin']}><AdminRiders /></ProtectedRoute>} />
                <Route path="users"      element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
