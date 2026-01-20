import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./ViewRegistrations.css";

const ViewRegistrations = () => {
  const navigate = useNavigate();
  const eventId = localStorage.getItem("activeEventId");

  const [eventInfo, setEventInfo] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  /* ================= GUARD ================= */
  if (!eventId) {
    return (
      <div className="admin-page">
        <h2>No Event Selected</h2>
        <button onClick={() => navigate("/admin/events")}>
          Go to Events
        </button>
      </div>
    );
  }

  useEffect(() => {
    loadEvent();
    fetchRegistrations();
  }, []);

  /* ================= LOAD EVENT ================= */
  const loadEvent = async () => {
    try {
      const res = await adminApiClient.get(`/events/${eventId}`);
      setEventInfo(res.data?.data || null);
    } catch {
      setError("Failed to load event info");
    }
  };

  /* ================= FETCH REGISTRATIONS ================= */
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ event-wise registrations
      const res = await adminApiClient.get(
        `/registrations/event/${eventId}`
      );
      setRegistrations(res.data?.data || []);
    } catch (err) {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CANCEL REGISTRATION ================= */
  const cancelRegistration = async (registrationId) => {
    if (!window.confirm("Cancel this registration?")) return;

    try {
      setActionLoading(registrationId);

      await adminApiClient.post(
        `/registrations/${registrationId}/cancel`
      );

      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <div className="admin-page">Loading registrations…</div>;
  }

  if (error) {
    return <div className="admin-page error">{error}</div>;
  }

  return (
    <div className="admin-page">
      {/* EVENT HEADER */}
      {eventInfo && (
        <div className="event-banner">
          <h2>{eventInfo.name || eventInfo.eventtitle}</h2>
          <p>
            📍 {eventInfo.venue} | 📅 {eventInfo.startDate || eventInfo.start_date} →{" "}
            {eventInfo.endDate || eventInfo.end_date}
          </p>
        </div>
      )}

      <div className="page-header">
        <h1>Registrations</h1>
        <p className="subtitle">
          Registrations for selected event’s masterclasses
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          No registrations found for this event
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Organisation</th>
                <th>Designation</th>
                <th>Country</th>
                <th>Postal Code</th>
                <th>Accessibility</th>
                <th>Masterclass</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((r) => (
                <tr key={r.registrationId || r.registration_id}>
                  <td>
                    <strong>{r.registrationId || r.registration_number}</strong>
                  </td>

                  <td>
                    <div className="user-cell">
                      <strong>{[r.name, r.surname].filter(Boolean).join(" ") || r.user_name}</strong>
                      <div className="muted">{r.email || r.user_email}</div>
                    </div>
                  </td>

                  <td>{r.mobile || r.user_mobile}</td>

                  <td>{r.company || r.organization || "—"}</td>

                  <td>{r.jobTitle || r.designation || "—"}</td>

                  <td>{r.country || "—"}</td>

                  <td>{r.postalCode || "—"}</td>

                  <td>{r.accessibilityNeeds || "—"}</td>

                  <td>{r.sessionTitle || r.session_title}</td>

                  <td>
                    <span
                      className={`badge badge-${String(r.status || "").toLowerCase()}`}
                    >
                      {String(r.status || "").toUpperCase()}
                    </span>
                  </td>

                  <td>
                    {String(r.status || "").toUpperCase() === "CONFIRMED" ? (
                      <button
                        className="danger-btn"
                        disabled={
                          actionLoading === (r.registrationId || r.registration_id)
                        }
                        onClick={() =>
                          cancelRegistration(
                            r.registrationId || r.registration_id
                          )
                        }
                      >
                        {actionLoading === (r.registrationId || r.registration_id)
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewRegistrations;
