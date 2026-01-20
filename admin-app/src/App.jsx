import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./components/auth/AdminLogin";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import EventList from "./components/event/EventList";
import ManageEvent from "./components/event/ManageEvent";
import CreateEvent from "./components/event/CreateEvent";
import ManageSessions from "./components/sessions/ManageSessions";
import ViewRegistrations from "./components/registrations/ViewRegistrations";
import ViewWaitlist from "./components/waitlist/ViewWaitlist";
import Scanner from "./components/scanner/Scanner";
import AdminSpeakers from "./components/speakers/AdminSpeakers";
import AdminAnalytics from "./components/analytics/AdminAnalytics";
import "./App.css";

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/new" element={<CreateEvent />} />
            <Route path="events/edit/:id" element={<ManageEvent />} />
            <Route path="sessions" element={<ManageSessions />} />
            <Route path="registrations" element={<ViewRegistrations />} />
            <Route path="waitlist" element={<ViewWaitlist />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="speakers" element={<AdminSpeakers />} />
          </Route>

          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
