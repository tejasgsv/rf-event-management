import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./ManageSessions.css";

const ManageSessions = () => {
  const navigate = useNavigate();
  const eventId = localStorage.getItem("activeEventId");

  const [eventInfo, setEventInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    hall: "",
    capacity: "",
    description: "",
    speaker_id: "",
    status: "LIVE",
  });

  const validateForm = () => {
    const errors = [];
    if (!form.title.trim()) errors.push("Title is required");
    if (!form.date) errors.push("Date is required");
    if (!form.startTime) errors.push("Start time is required");
    if (!form.endTime) errors.push("End time is required");
    if (!form.capacity || form.capacity <= 0) errors.push("Capacity must be > 0");
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.push("End time must be after start time");
    }
    return errors;
  };

  /* ================= GUARD ================= */
  if (!eventId) {
    return (
      <div className="page-container">
        <h2>No Event Selected</h2>
        <button onClick={() => navigate("/admin/events")}>
          Go to Events
        </button>
      </div>
    );
  }

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadEvent();
    fetchSessions();
    fetchSpeakers();
  }, []);

  const loadEvent = async () => {
    try {
      const res = await adminApiClient.get(`/events/${eventId}`);

      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }

      setEventInfo(res.data.data);
    } catch (err) {
      console.error("Event load error:", err);
      setError("Failed to load event info");
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminApiClient.get(
        `/sessions?eventId=${eventId}`
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }

      setSessions(res.data.data || []);
    } catch (err) {
      console.error("Session load error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load sessions");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= SPEAKERS (OPTIONAL) ================= */
  const fetchSpeakers = async () => {
    try {
      const res = await adminApiClient.get("/speakers");
      const raw = res?.data?.data || [];
      const list = raw.map((sp) => ({
        speaker_id: sp.id,
        full_name: sp.name,
      }));
      setSpeakers(list);
    } catch {
      setSpeakers([]);
    }
  };

  /* ================= HELPERS ================= */
  const buildDateTime = (d, t) =>
    new Date(`${d}T${t}:00`).toISOString();

  const resetForm = () => {
    setForm({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      hall: "",
      capacity: "",
      description: "",
      speaker_id: "",
      status: "LIVE",
    });
    setEditing(null);
    setShowForm(false);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setError(formErrors.join(", "));
      return;
    }

    const startDT = buildDateTime(form.date, form.startTime);
    const payload = {
      eventId: eventId,
      title: form.title,
      startTime: startDT,
      endTime: buildDateTime(form.date, form.endTime),
      location: form.hall || "TBD",
      capacity: parseInt(form.capacity),
      description: form.description || null,
      speakerId: form.speaker_id ? parseInt(form.speaker_id) : null,
      status: form.status || "DRAFT",
      registrationCloseTime: new Date(new Date(startDT).getTime() - 60*60000).toISOString(),
      waitlistCloseTime: new Date(new Date(startDT).getTime() - 30*60000).toISOString(),
    };

    try {
      let res;
      if (editing) {
        res = await adminApiClient.put(
          `/sessions/${editing.id}`,
          payload
        );
      } else {
        res = await adminApiClient.post("/sessions", payload);
      }

      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }

      resetForm();
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title,
      date: s.startTime.split("T")[0],
      startTime: s.startTime.split("T")[1].slice(0, 5),
      endTime: s.endTime.split("T")[1].slice(0, 5),
      hall: s.location || "",
      capacity: s.capacity || "",
      description: s.description || "",
      speaker_id: s.speaker_id || s.speakerId || "",
      status: s.status || "DRAFT",
    });
    setShowForm(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this masterclass?")) return;

    try {
      const res = await adminApiClient.delete(`/sessions/${id}`);
      if (!res.data?.success) {
        throw new Error(res.data?.message);
      }
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <p className="center">Loading sessions…</p>;

  /* ================= UI ================= */
  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <button onClick={() => navigate("/admin/events")} className="breadcrumb-btn">
          ← Events
        </button>
        <span className="breadcrumb-sep">→</span>
        <span className="breadcrumb-text">
          {eventInfo ? eventInfo.eventtitle || eventInfo.name : "Event"}
        </span>
      </div>

      {eventInfo && (
        <div className="event-banner">
          <h2>{eventInfo.eventtitle || eventInfo.name}</h2>
          <p>
            📍 {eventInfo.venue} | 📅 {eventInfo.start_date || eventInfo.startDate} → {eventInfo.end_date || eventInfo.endDate}
          </p>
        </div>
      )}

      <div className="header-row">
        <h2>Sessions</h2>
        <div className="header-actions">
          <button className="btn primary" onClick={() => setShowForm(true)}>
            + Add Session
          </button>
          <button
            className="btn secondary"
            onClick={() => navigate("/admin/speakers")}
          >
            + Add Speaker
          </button>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="workflow-info">
        <h4>📋 Workflow:</h4>
        <div className="workflow-steps">
          <div className="step">
            <span className="step-num">1</span>
            <span>Event Created</span>
          </div>
          <span className="arrow">→</span>
          <div className="step">
            <span className="step-num">2</span>
            <span>Add Masterclass</span>
          </div>
          <span className="arrow">→</span>
          <div className="step">
            <span className="step-num">3</span>
            <span>Assign Speaker</span>
          </div>
          <span className="arrow">→</span>
          <div className="step">
            <span className="step-num">4</span>
            <span>Publish Event</span>
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="session-form" onSubmit={handleSubmit}>
          <h3>{editing ? "Edit Masterclass" : "Add Masterclass"}</h3>

          <label>Title *</label>
          <input
            placeholder="Masterclass Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <label>Speaker</label>
          <select
            value={form.speaker_id}
            onChange={(e) =>
              setForm({ ...form, speaker_id: e.target.value })
            }
          >
            <option value="">Select Speaker (optional)</option>
            {speakers.map((sp) => (
              <option key={sp.speaker_id} value={sp.speaker_id}>
                {sp.full_name}
              </option>
            ))}
          </select>
          {speakers.length === 0 && (
            <p className="helper-text">No speakers yet. Add one from the Speakers page.</p>
          )}

          <label>Status *</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="LIVE">Live (Visible on frontend)</option>
            <option value="DRAFT">Draft (Hidden)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <label>Description</label>
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <div className="form-grid">
            <div>
              <label>Date *</label>
              <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              />
            </div>
            <div>
              <label>Start Time *</label>
              <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
              />
            </div>
            <div>
              <label>End Time *</label>
              <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
              />
            </div>
            <div>
              <label>Hall / Room</label>
              <input
              placeholder="Hall / Room"
              value={form.hall}
              onChange={(e) =>
                setForm({ ...form, hall: e.target.value })
              }
              />
            </div>
            <div>
              <label>Capacity *</label>
              <input
              type="number"
              placeholder="Capacity *"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: e.target.value })
              }
              min="1"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">
              {editing ? "Update Masterclass" : "Create Masterclass"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="session-grid">
        {sessions.map((s) => (
          <div className="session-card" key={s.id}>
            <div className="session-card-header">
              <h4>{s.title}</h4>
              <span className={`status-pill ${String(s.status || "DRAFT").toLowerCase()}`}>
                {s.status || "DRAFT"}
              </span>
            </div>
            <p className="muted">📍 {s.location} | 👥 {s.capacity} seats</p>
            <p className="muted">🪑 {s.registered_count || 0} confirmed</p>
            {s.speakerName && (
              <p className="speaker-badge">🎤 Speaker: {s.speakerName}</p>
            )}

            <div className="card-actions">
              <button onClick={() => handleEdit(s)}>Edit</button>
              <button
                onClick={() => handleDelete(s.id)}
                className="danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <p className="empty-state">No masterclasses added yet</p>
      )}
    </div>
  );
};

export default ManageSessions;
