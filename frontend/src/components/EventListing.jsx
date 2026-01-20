import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EventListing.css";

const EventListing = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
    // Auto-refresh every 30 seconds to catch admin updates
    const interval = setInterval(() => {
      fetchEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // Filter to only ACTIVE/PUBLISHED events created by admin
      const adminEvents = (data.data || data || []).filter(
        (e) => e.status === "ACTIVE" || e.status === "PUBLISHED"
      );
      
      setEvents(adminEvents);
      setError("");
      setLastUpdate(new Date());
      setNotification("✅ Events updated");

      if (adminEvents.length === 0) {
        setNotification("⏳ No active events yet");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="event-listing">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-listing">
      {/* Notification Banner */}
      {notification && (
        <div className="notification-banner">
          <span>{notification}</span>
          <button onClick={() => setNotification("")}>✕</button>
        </div>
      )}

      {/* Header Section */}
      <div className="listing-header">
        <div className="header-content">
          <h1>🎪 Events & Masterclasses</h1>
          <p>Discover and register for amazing events</p>
        </div>
        <button onClick={fetchEvents} className="btn-refresh-events">
          🔄 Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchEvents} className="btn-retry">
            Try Again
          </button>
        </div>
      )}

      {/* Events Grid or Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No events found</h3>
          <p>
            {searchQuery
              ? "Try adjusting your search criteria"
              : "No events available at the moment"}
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id || event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const eventId = event.id || event.event_id;
  const eventName = event.name || event.event_name || event.eventtitle;
  const eventDate = new Date(event.startDate || event.start_date);
  const endDate = new Date(event.endDate || event.end_date);

  const formattedStartDate = eventDate.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedEndDate = endDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  const sessionCount = event.masterclasses?.length || 0;
  const totalSeats = event.total_seats || 0;
  const bookedSeats = event.masterclasses?.reduce(
    (sum, m) => sum + (m.confirmed_count || 0),
    0
  ) || 0;

  const occupancyPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

  const getStatusColor = (status) => {
    const statusLower = (status || "draft").toLowerCase();
    if (statusLower === "published" || statusLower === "active") {
      return "status-active";
    }
    if (statusLower === "completed") {
      return "status-completed";
    }
    return "status-draft";
  };

  return (
    <div className="event-card">
      {/* Event Card Header */}
      <div className="event-card-header">
        <div className="event-badge">{sessionCount} sessions</div>
        <span className={`event-status-badge ${getStatusColor(event.status)}`}>
          {event.status || "DRAFT"}
        </span>
      </div>

      {/* Event Card Content */}
      <div className="event-card-content">
        <h3 className="event-name">{eventName}</h3>

        {/* Date Range */}
        <div className="event-meta">
          <span className="meta-item">
            <span className="icon">📅</span>
            <span>
              {formattedStartDate} - {formattedEndDate}
            </span>
          </span>
        </div>

        {/* Venue */}
        <div className="event-location">
          <span className="icon">📍</span>
          <span>{event.venue || "Venue TBD"}</span>
        </div>

        {/* Description */}
        {event.description && (
          <p className="event-description">{event.description.substring(0, 100)}...</p>
        )}

        {/* Sessions Preview */}
        <div className="sessions-preview">
          <div className="preview-item">
            <span className="label">Sessions</span>
            <span className="value">{sessionCount}</span>
          </div>
          <div className="preview-item">
            <span className="label">Available</span>
            <span className="value">{Math.max(0, totalSeats - bookedSeats)}</span>
          </div>
        </div>

        {/* Occupancy Bar */}
        {totalSeats > 0 && (
          <div className="occupancy-section">
            <div className="occupancy-header">
              <span className="occupancy-label">Capacity</span>
              <span className="occupancy-percent">{Math.round(occupancyPercentage)}%</span>
            </div>
            <div className="occupancy-bar">
              <div
                className="occupancy-fill"
                style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="occupancy-text">
              {bookedSeats} / {totalSeats} seats
            </div>
          </div>
        )}
      </div>

      {/* Event Card Footer */}
      <div className="event-card-footer">
        <button 
          onClick={() => navigate(`/event/${eventId}`)}
          className="btn-view-event"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default EventListing;
