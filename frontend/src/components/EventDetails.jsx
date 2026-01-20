import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/EventDetails.css";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH EVENT =================
  useEffect(() => {
    fetchEvent();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchEvent(true), 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchEvent = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await apiClient.get(`/events/${id}`);

      // handle both formats
      const eventData = res.data?.data || res.data;
      setEvent(eventData);
      setError("");
    } catch (err) {
      console.error("Event load failed:", err);
      setError("Failed to load event details");
      setEvent(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= UI STATES =================
  if (loading) {
    return (
      <div className="event-home loading">
        <p>Loading event details…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-home">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Event not found</h2>
        <p>Please check again later.</p>
      </div>
    );
  }


  // ================= RENDER =================
  return (
    <div className="event-home">
      {/* BACK BUTTON */}
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* HERO */}
      <section className="hero hero-gradient">
        <div className="hero-content">
          <h1>{event.name || event.eventtitle}</h1>
          <p>{event.venue}</p>
        </div>
      </section>

      {/* DETAILS */}
      <section className="event-section">
        <div className="event-grid">
          <div className="event-card" style={{ cursor: "default" }}>
            <p>
              <strong>📅 Dates:</strong>
              <br />
              {formatDate(event.startDate)} –{" "}
              {formatDate(event.endDate)}
            </p>

            <p>
              <strong>📍 Venue:</strong>
              <br />
              {event.venue}
            </p>

            {event.description && (
              <p>
                <strong>📝 Description:</strong>
                <br />
                {event.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA → EVENT-WISE AGENDA */}
      <section style={{ textAlign: "center", margin: "30px 0" }}>
        <Link to={`/agenda/${event.id}`} className="btn btn-primary">
          📅 View Event Agenda
        </Link>
      </section>
    </div>
  );
};

export default EventDetails;
