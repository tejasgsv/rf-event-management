import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./ManageEvent.css";

const STATUS_META = {
  DRAFT: { label: "Draft", color: "gray" },
  PUBLISHED: { label: "Published", color: "green" },
  ARCHIVED: { label: "Archived", color: "red" },
};

const ManageEvent = ({ onDataUpdated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id;

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    venue: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "DRAFT",
  });

  /* ================= FETCH EVENT ================= */
  useEffect(() => {
    if (isCreate) return;

    const fetchEvent = async () => {
      try {
        const res = await adminApiClient.get(`/events/${id}`);
        const e = res.data?.data || {};

        const normalizeDate = (value) => {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return value;
          return date.toISOString().slice(0, 10);
        };

        setForm({
          name: e.name || e.eventtitle || "",
          venue: e.venue || "",
          startDate: normalizeDate(e.startDate || e.start_date),
          endDate: normalizeDate(e.endDate || e.end_date),
          description: e.description || "",
          status: e.status || "DRAFT",
        });
      } catch {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isCreate]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!form.name.trim()) return "Event title is required";
    if (!form.startDate || !form.endDate)
      return "Start and end date are required";
    if (form.endDate < form.startDate)
      return "End date cannot be before start date";
    return null;
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isCreate) {
        // 🔥 CREATE EVENT → DIRECT SESSION FLOW
        const res = await adminApiClient.post("/events", {
          name: form.name,
          venue: form.venue,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          status: form.status,
        });
        const createdEvent = res.data.data;

        localStorage.setItem("activeEventId", createdEvent.id);
        navigate("/admin/masterclasses");
      } else {
        // UPDATE EVENT
        await adminApiClient.put(`/events/${id}`, {
          name: form.name,
          venue: form.venue,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          status: form.status,
        });
        onDataUpdated && onDataUpdated();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Delete this event permanently?")) return;

    try {
      await adminApiClient.delete(`/events/${id}`);
      navigate("/admin/events");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="page-loading">Loading…</div>;

  const isArchived = form.status === "ARCHIVED";

  return (
    <div className="manage-event-page">
      {/* HEADER */}
      <div className="event-header">
        <div>
          <h1>{isCreate ? "Create New Event" : "Manage Event"}</h1>

          {!isCreate && (
            <span className={`status-badge ${form.status.toLowerCase()}`}>
              {STATUS_META[form.status].label}
            </span>
          )}
        </div>

        <div className="header-actions">
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={saving || isArchived}
          >
            {saving ? "Saving..." : isCreate ? "Create Event" : "Save Changes"}
          </button>

          {!isCreate && (
            <>
              <button
                className="btn secondary"
                onClick={() => {
                  localStorage.setItem("activeEventId", id);
                  navigate("/admin/masterclasses");
                }}
              >
                Manage Sessions
              </button>

              <button className="btn danger" onClick={handleDelete}>
                Delete Event
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* FORM GRID */}
      <div className="event-grid">
        <div className="card">
          <h3>Basic Information</h3>

          <label>Event Title</label>
          <input
            value={form.name}
            disabled={isArchived}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <label>Venue</label>
          <input
            value={form.venue}
            disabled={isArchived}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </div>

        <div className="card">
          <h3>Schedule</h3>

          <label>Start Date</label>
          <input
            type="date"
            disabled={isArchived}
            value={form.startDate}
            onChange={(e) =>
              setForm({ ...form, startDate: e.target.value })
            }
          />

          <label>End Date</label>
          <input
            type="date"
            disabled={isArchived}
            value={form.endDate}
            onChange={(e) =>
              setForm({ ...form, endDate: e.target.value })
            }
          />
        </div>

        {!isCreate && (
          <div className="card">
            <h3>Controls</h3>

            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvent;
