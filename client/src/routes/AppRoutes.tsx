import { Routes, Route } from 'react-router-dom';
import Home from '../pages/shared/Home';
import Login from '../pages/shared/Login';
import Register from '../pages/shared/Register';
import Services from '../pages/shared/Services';
import Unauthorized from '../pages/shared/Unauthorized';
import ProtectedRoute from './ProtectedRoute';

import ProviderDashboard from '../pages/provider/ProviderDashboard';
import BookingForm from '../pages/booking/BookingForm';
import BrowseJobs from '../pages/provider/BrowseJobs';
import MakeOffer from '../pages/provider/MakeOffer';
import MyOffers from '../pages/provider/MyOffers';

import CustomerDashboard from '../pages/customer/CustomerDashboard';
import PostJob from '../pages/customer/PostJob';
import ViewOffers from '../pages/customer/ViewOffers';
import JobDetails from '../pages/customer/JobDetails'; 

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAnalytics from '../pages/admin/AdminAnalytics';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}

      {/* Provider */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse-jobs"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <BrowseJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/make-offer/:jobId"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <MakeOffer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-offers"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <MyOffers />
          </ProtectedRoute>
        }
      />

      {/* Customer */}
      <Route
        path="/dashboard-customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post-job"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job/:jobId/offers"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ViewOffers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job/:jobId/details"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <BookingForm />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
