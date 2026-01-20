import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApiClient from "../../utils/adminApiClient";
import "./EventForm.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    venue: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "PUBLISHED",
  });

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Event title is required";
    if (!form.venue.trim()) errors.venue = "Venue is required";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (!form.endDate) errors.endDate = "End date is required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errors.endDate = "End date must be after start date";
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const createEvent = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await adminApiClient.post("/events", {
        name: form.name,
        venue: form.venue,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        status: form.status || "PUBLISHED",
      });
      const newEventId = res.data?.data?.id;
      if (newEventId) {
        localStorage.setItem("activeEventId", newEventId);
        navigate("/admin/masterclasses");
      } else {
        navigate("/admin/events");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
      console.error("Create event error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="event-form-page">
      {/* Page Header */}
      <div className="form-page-header">
        <div className="header-content">
          <h1>➕ Create New Event</h1>
          <p>Add a new event to your platform</p>
        </div>
        <button
          className="btn-submit"
          onClick={createEvent}
          disabled={saving}
        >
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="form-container">
        {/* Section 1: Basic Information */}
        <div className="form-section">
          <div className="section-header">
            <h2>📋 Basic Information</h2>
            <p>Enter the main event details</p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Event Title *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              placeholder="e.g., Annual Tech Conference 2024"
              className={`form-input ${formErrors.name ? 'input-error' : ''}`}
            />
            {formErrors.name && (
              <span className="error-text">{formErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="venue">Venue / Location *</label>
            <input
              id="venue"
              name="venue"
              type="text"
              value={form.venue}
              onChange={handleInputChange}
              placeholder="e.g., Grand Convention Center, New Delhi"
              className={`form-input ${formErrors.venue ? 'input-error' : ''}`}
            />
            {formErrors.venue && (
              <span className="error-text">{formErrors.venue}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter event description, highlights, and important information..."
              rows="5"
              className="form-input form-textarea"
            ></textarea>
            <span className="char-count">{form.description.length} characters</span>
          </div>
        </div>

        {/* Section 2: Dates & Schedule */}
        <div className="form-section">
          <div className="section-header">
            <h2>📅 Event Schedule</h2>
            <p>Set the event duration</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleInputChange}
                className={`form-input ${formErrors.startDate ? 'input-error' : ''}`}
              />
              {formErrors.startDate && (
                <span className="error-text">{formErrors.startDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleInputChange}
                className={`form-input ${formErrors.endDate ? 'input-error' : ''}`}
              />
              {formErrors.endDate && (
                <span className="error-text">{formErrors.endDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Visibility */}
        <div className="form-section">
          <div className="section-header">
            <h2>👁️ Visibility</h2>
            <p>Published events appear in the frontend</p>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="PUBLISHED">Published (Visible)</option>
              <option value="DRAFT">Draft (Hidden)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

      </div>

      {/* Form Footer */}
      <div className="form-footer">
        <button
          className="btn-cancel"
          onClick={() => navigate("/admin/events")}
        >
          Cancel
        </button>
        <button
          className="btn-submit"
          onClick={createEvent}
          disabled={saving}
        >
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
