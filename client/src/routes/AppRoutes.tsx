import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Services from '../pages/Services';
import ProviderDashboard from '../pages/ProviderDashboard';
import BookingForm from '../pages/BookingForm';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/services" element={<Services />} />
      <Route path="/provider" element={<ProviderDashboard />} />
      <Route path="/book" element={<BookingForm />} />
    </Routes>
  );
}
