import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./event.css";

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const EventList = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminApiClient.get("/events");

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Invalid response");
      }

      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Event load error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load events");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= STATUS UPDATE ================= */
  const handleStatusChange = async (eventId, newStatus) => {
    if (!window.confirm(`Change event status to ${newStatus}?`)) return;

    setUpdatingId(eventId);
    try {
      const res = await adminApiClient.put(`/events/${eventId}`, {
        status: newStatus,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: newStatus } : e
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (event) => {
    if (
      !window.confirm(
        `Delete "${event.eventtitle}"?\n\nThis will remove all related sessions and registrations.`
      )
    )
      return;

    try {
      const res = await adminApiClient.delete(`/events/${event.id}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }

      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  /* ================= OPEN MASTERCLASSES ================= */
  const openMasterclasses = (event) => {
    localStorage.setItem("activeEventId", event.id);
    navigate("/admin/sessions");
  };

  const statusBadge = (status) => {
    if (status === "PUBLISHED") return "badge badge-active";
    if (status === "DRAFT") return "badge badge-draft";
    return "badge badge-archived";
  };

  const getEventTitle = (event) =>
    event.name || event.eventtitle || event.event_name || "Untitled Event";

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div className="admin-page">Loading events…</div>;
  if (error) return <div className="admin-page error">{error}</div>;

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p className="subtitle">
            Create an event, then add sessions (masterclasses) under it
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/events/new")}
        >
          + Create Event
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Venue</th>
              <th>Dates</th>
              <th>Booked</th>
              <th>Status</th>
              <th style={{ width: 280 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <strong>{getEventTitle(event)}</strong>
                </td>

                <td>{event.venue}</td>

                <td>
                  {formatDate(event.startDate || event.start_date)} → {formatDate(event.endDate || event.end_date)}
                </td>

                <td>
                  <strong>{event.bookedCount ?? 0}</strong>
                </td>

                <td>
                  <span className={statusBadge(event.status)}>
                    {event.status}
                  </span>

                  <select
                    className="status-select"
                    value={event.status}
                    disabled={updatingId === event.id}
                    onChange={(e) =>
                      handleStatusChange(event.id, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="actions-cell">
                  <button
                    className="btn small primary"
                    onClick={() => openMasterclasses(event)}
                  >
                    🎤 Manage Sessions
                  </button>

                  <button
                    className="btn small secondary"
                    onClick={() =>
                      navigate(`/admin/events/edit/${event.id}`)
                    }
                  >
                    Edit Event
                  </button>

                  <button
                    className="btn small danger"
                    onClick={() => handleDelete(event)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="empty-state">No events created yet</div>
        )}
      </div>
    </div>
  );
};

export default EventList;
