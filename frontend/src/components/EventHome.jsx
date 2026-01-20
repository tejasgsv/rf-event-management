import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import HeroSlider from "./HeroSlider";
import "../styles/EventHome.css";

/* ================= HELPERS ================= */

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/* ================= COMPONENT ================= */

const EventHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    const [eventsResult] = await Promise.allSettled([
      apiClient.get("/events"),
    ]);

    if (eventsResult.status === "fulfilled") {
      const list = Array.isArray(eventsResult.value.data)
        ? eventsResult.value.data
        : eventsResult.value.data?.data || [];
      setEvents(list);
    } else {
      const err = eventsResult.reason;
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load events. Please try again.";
      setError(errorMsg);
    }

    setLoading(false);
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="home-loading">Loading events…</div>;
  }

  if (error) {
    return (
      <div className="home-container empty">
        <h1>⚠️ Error</h1>
        <p>{error}</p>
        <button onClick={fetchData} className="btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="home-container empty">
        <h1>No Events Available</h1>
        <p>No events have been created yet. Please check back later.</p>
        <button onClick={fetchData} className="btn-primary" style={{ marginTop: '1rem' }}>
          Refresh
        </button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="home-container">
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider events={events} />

      {/* ================= ALL EVENTS GRID ================= */}
      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">All Live Events</h2>
          <p className="section-subtitle">Browse and register for upcoming sessions</p>
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="card-header">
                <div className="card-badge">{event.status}</div>
                <button className="card-bookmark">⭐</button>
              </div>
              
              <div className="card-body">
                <h3 className="card-title">{event.name || event.eventtitle}</h3>
                
                <div className="card-info">
                  <div className="info-row">
                    <span className="info-icon">📅</span>
                    <span className="info-text">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">📍</span>
                    <span className="info-text">{event.venue}</span>
                  </div>
                </div>

                {event.description && (
                  <p className="card-description">{event.description.substring(0, 100)}...</p>
                )}
              </div>

              <div className="card-footer">
                <Link to={`/agenda/${event.id}`} className="card-btn-primary">
                  View Sessions →
                </Link>
                <Link to={`/event/${event.id}`} className="card-btn-text">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default EventHome;
