import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Services from '../pages/Services';
import ProviderDashboard from '../pages/ProviderDashboard';
import BookingForm from '../pages/BookingForm';
import ProtectedRoute from "../routes/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/book" element={<BookingForm />} />

      {/* Protected Provider Route */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute>
            {user?.role === "provider" ? (
              <ProviderDashboard />
            ) : (
              <Navigate to="/" />
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
