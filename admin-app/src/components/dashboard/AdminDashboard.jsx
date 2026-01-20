import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      const [dashboardRes, eventsRes] = await Promise.all([
        adminApiClient.get("/dashboard"),
        adminApiClient.get("/events"),
      ]);

      const eventsData = eventsRes.data?.data || eventsRes.data || [];
      const dashboard = dashboardRes.data || {};
      setEvents(eventsData);

      const totalEvents = eventsData.length;
      const activeEvents = eventsData.filter((e) => e.status === "PUBLISHED").length;
      const totalMasterclasses = dashboard?.stats?.sessions || 0;
      const totalRegistrations = dashboard?.stats?.registrations || 0;
      const totalWaitlist = dashboard?.stats?.waitlist || 0;
      const utilization = dashboard?.stats?.utilization || 0;

      setStats({
        totalEvents,
        activeEvents,
        totalRegistrations,
        totalWaitlist,
        totalMasterclasses,
        attendanceRate: utilization,
        capacityUtilization: utilization,
      });

      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button onClick={fetchDashboardData} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with Refresh */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">📊 Dashboard</h1>
          <p className="header-subtitle">Event & Masterclass Management Overview</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          disabled={refreshing}
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          title="Refresh data"
        >
          🔄
        </button>
      </div>

      {/* Stats Grid - Key Metrics */}
      <div className="stats-grid">
        <StatCard 
          icon="🎪" 
          value={stats?.totalEvents || 0}
          label="Total Events"
          trend={stats?.activeEvents}
          trendLabel="Active"
          color="primary"
        />
        <StatCard 
          icon="✅" 
          value={stats?.activeEvents || 0}
          label="Active Events"
          percentage={(stats?.activeEvents / Math.max(stats?.totalEvents, 1) * 100).toFixed(0)}
          color="success"
        />
        <StatCard 
          icon="🎤" 
          value={stats?.totalMasterclasses || 0}
          label="Total Sessions"
          trend={stats?.totalRegistrations}
          trendLabel="Registered"
          color="info"
        />
        <StatCard 
          icon="👥" 
          value={stats?.totalRegistrations || 0}
          label="Registrations"
          trend={stats?.totalWaitlist}
          trendLabel="Waitlist"
          color="warning"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-header">
            <h3>📈 Capacity Utilization</h3>
            <span className="metric-value">{stats?.capacityUtilization || 0}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats?.capacityUtilization || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <h3>⏳ Waitlist Status</h3>
            <span className="metric-value">{stats?.totalWaitlist || 0}</span>
          </div>
          <p className="metric-description">People waiting to register</p>
        </div>

        <div className="metric-box">
          <div className="metric-header">
            <h3>🎯 Attendance Rate</h3>
            <span className="metric-value">{stats?.attendanceRate || 0}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill success" 
              style={{ width: `${stats?.attendanceRate || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h2 className="section-title">🚀 Quick Actions</h2>
        <div className="actions-grid">
          <ActionButton 
            icon="➕" 
            label="Create Event" 
            href="/admin/events/new" 
            className="action-create"
          />
          <ActionButton 
            icon="➕" 
            label="Add Session" 
            href="/admin/sessions" 
            className="action-session"
          />
          <ActionButton 
            icon="👥" 
            label="Manage Speakers" 
            href="/admin/speakers" 
            className="action-speakers"
          />
          <ActionButton 
            icon="📋" 
            label="View Registrations" 
            href="/admin/registrations" 
            className="action-registrations"
          />
          <ActionButton 
            icon="⏳" 
            label="Waitlist Queue" 
            href="/admin/waitlist" 
            className="action-waitlist"
          />
          <ActionButton 
            icon="📷" 
            label="Check-In Scanner" 
            href="/admin/scanner" 
            className="action-scanner"
          />
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="recent-events-section">
        <h2 className="section-title">📅 Recent Events</h2>
        
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No events yet</h3>
            <p>Create your first event to get started</p>
            <Link to="/admin/events/new" className="btn-primary">Create Event</Link>
          </div>
        ) : (
          <div className="events-grid">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id || event.event_id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, trend, trendLabel, percentage, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div className="stat-trend">
          <span className="trend-value">{trend}</span>
          <span className="trend-label">{trendLabel}</span>
        </div>
      )}
      {percentage && (
        <div className="stat-percentage">{percentage}% of total</div>
      )}
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ icon, label, href, className }) => (
  <Link to={href} className={`action-button ${className}`}>
    <span className="action-icon">{icon}</span>
    <span className="action-label">{label}</span>
    <span className="action-arrow">→</span>
  </Link>
);

// Event Card Component
const EventCard = ({ event }) => {
  const eventId = event.id || event.event_id;
  const eventDate = new Date(event.startDate || event.start_date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.name || event.event_name}</h3>
        <span className={`status-badge status-${(event.status || 'draft').toLowerCase()}`}>
          {event.status || 'DRAFT'}
        </span>
      </div>

      <div className="event-info">
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">{event.venue || 'No venue'}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">📅</span>
          <span className="info-text">{eventDate}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🎤</span>
          <span className="info-text">Sessions managed in dashboard</span>
        </div>
      </div>

      <div className="event-stats">
        <div className="stat">
          <span className="stat-icon">👥</span>
          <span className="stat-text">Manage registrations</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⏳</span>
          <span className="stat-text">Manage waitlist</span>
        </div>
      </div>

      <div className="event-actions">
        <Link to={`/admin/events/edit/${eventId}`} className="btn-secondary">
          Edit Event
        </Link>
        <Link
          to={`/admin/sessions`}
          className="btn-primary"
          onClick={() => localStorage.setItem("activeEventId", eventId)}
        >
          Manage Sessions
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
