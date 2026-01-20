import React, { useEffect, useState } from "react";
import adminApiClient from "../../utils/adminApiClient";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminApiClient.get("/dashboard");
      setDashboard(res.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-page">Loading analytics…</div>;

  if (error) {
    return (
      <div className="admin-page">
        <div className="alert error">{error}</div>
        <button className="btn btn-secondary" onClick={loadAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  const event = dashboard?.event;
  const stats = dashboard?.stats || {};

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">Live insights from the latest event</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAnalytics}>
          Refresh
        </button>
      </div>

      {!dashboard?.eventExists ? (
        <div className="empty-state">No events available yet.</div>
      ) : (
        <>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Sessions</h3>
              <p className="metric">{stats.sessions || 0}</p>
            </div>
            <div className="analytics-card">
              <h3>Registrations</h3>
              <p className="metric">{stats.registrations || 0}</p>
            </div>
            <div className="analytics-card">
              <h3>Waitlist</h3>
              <p className="metric">{stats.waitlist || 0}</p>
            </div>
            <div className="analytics-card">
              <h3>Utilization</h3>
              <p className="metric">{stats.utilization || 0}%</p>
            </div>
          </div>

          {event && (
            <div className="event-summary">
              <h2>{event.name}</h2>
              <p>
                📍 {event.venue} • 📅 {new Date(event.startDate).toLocaleDateString("en-IN")} →{" "}
                {new Date(event.endDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
