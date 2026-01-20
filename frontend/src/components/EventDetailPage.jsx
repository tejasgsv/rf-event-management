import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EventDetailPage.css";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [masterclasses, setMasterclasses] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [activeTab, setActiveTab] = useState("masterclasses");

  useEffect(() => {
    fetchEventDetails();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchEventDetails();
    }, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventRes = await fetch(`http://localhost:5000/api/events/${eventId}`);
      const eventData = await eventRes.json();

      if (!eventData.success && !eventData.data) {
        throw new Error("Event not found");
      }

      const eventInfo = eventData.data || eventData;
      setEvent(eventInfo);

      // Fetch masterclasses for this event (LIVE only)
      const mcRes = await fetch(
        `http://localhost:5000/api/masterclasses/event/${eventId}`
      );
      const mcData = await mcRes.json();

      const liveMasterclasses = (mcData.data || []).filter(
        (m) => m.status === "LIVE"
      );
      setMasterclasses(liveMasterclasses);

      // Extract speakers from masterclasses
      const speakerSet = new Set();
      const speakerMap = {};

      liveMasterclasses.forEach((mc) => {
        if (mc.speakerId) {
          speakerSet.add(mc.speakerId);
          speakerMap[mc.speakerId] = {
            speakerId: mc.speakerId,
            masterclassId: mc.id,
            masterclassName: mc.title,
            startTime: mc.startTime,
          };
        }
      });

      // Fetch speaker details
      if (speakerSet.size > 0) {
        const speakersRes = await fetch(
          `http://localhost:5000/api/speakers`
        );
        const speakersData = await speakersRes.json();
        const allSpeakers = speakersData.data || [];

        const eventSpeakers = allSpeakers
          .filter((s) => speakerSet.has(s.id))
          .map((s) => ({
            ...s,
            assignedMasterclass: speakerMap[s.id] || {},
          }));

        setSpeakers(eventSpeakers);
      }

      setError("");
      setNotification("✅ Event details updated");
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-page loading">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page error">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>{error || "Event not found"}</p>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      {/* Notification */}
      {notification && (
        <div className="notification-banner">
          <span>{notification}</span>
          <button onClick={() => setNotification("")}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Events
        </button>
        <h1>{event.name || event.eventtitle}</h1>
        <p className="venue">📍 {event.venue}</p>
        <p className="dates">
          📅 {event.startDate || event.start_date} → {event.endDate || event.end_date}
        </p>
        <p className="description">{event.description}</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "masterclasses" ? "active" : ""}`}
          onClick={() => setActiveTab("masterclasses")}
        >
          🎤 Masterclasses
        </button>
        <button
          className={`tab-btn ${activeTab === "speakers" ? "active" : ""}`}
          onClick={() => setActiveTab("speakers")}
        >
          🎓 Speakers
        </button>
      </div>

      {/* Masterclasses Tab */}
      {activeTab === "masterclasses" && (
        <div className="masterclasses-section">
          <div className="section-header">
            <h2>📋 Sessions / Masterclasses</h2>
            <p>{masterclasses.length} sessions available</p>
          </div>

          <div className="masterclass-grid">
            {masterclasses.map((mc) => (
              <div key={mc.id} className="masterclass-card">
                <div className="mc-header">
                  <h3>{mc.title}</h3>
                  <span className="status-badge live">LIVE</span>
                </div>

                <div className="mc-details">
                  <p>
                    <strong>⏰ Time:</strong>{" "}
                    {new Date(mc.startTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>📍 Location:</strong> {mc.location}
                  </p>
                  <p>
                    <strong>👥 Capacity:</strong> {mc.capacity} seats
                  </p>
                  <p>
                    <strong>🪑 Available:</strong>{" "}
                    {mc.available_seats || mc.capacity} seats
                  </p>
                </div>

                <div className="mc-agenda">
                  <strong>📚 Agenda:</strong>
                  <p>{mc.description || "No description provided"}</p>
                </div>

                <div className="registration-info">
                  <p>
                    <strong>✅ Confirmed:</strong>{" "}
                    {mc.registered_count || 0} participants
                  </p>
                  <p>
                    <strong>⏳ Waitlist:</strong>{" "}
                    {mc.waitlist_count || 0} waiting
                  </p>
                </div>

                <button
                  className="btn-register"
                  onClick={() =>
                    navigate(`/register/${mc.id}`, {
                      state: { masterclass: mc },
                    })
                  }
                >
                  📝 Register / View QR
                </button>
              </div>
            ))}
          </div>

          {masterclasses.length === 0 && (
            <div className="empty-state">
              <p>No masterclasses scheduled yet for this event.</p>
            </div>
          )}
        </div>
      )}

      {/* Speakers Tab */}
      {activeTab === "speakers" && (
        <div className="speakers-section">
          <div className="section-header">
            <h2>🎓 Expert Speakers</h2>
            <p>{speakers.length} speakers</p>
          </div>

          <div className="speakers-grid">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="speaker-card-detail">
                <div className="speaker-photo">
                  {speaker.photo ? (
                    <img src={speaker.photo} alt={speaker.name} />
                  ) : (
                    <div className="avatar">{speaker.name.charAt(0)}</div>
                  )}
                </div>

                <div className="speaker-content">
                  <h3>{speaker.name}</h3>
                  <p className="title">{speaker.title || "Speaker"}</p>
                  <p className="designation">{speaker.designation}</p>
                  <p className="organization">{speaker.organization}</p>

                  {speaker.bio && (
                    <p className="bio">{speaker.bio}</p>
                  )}

                  {speaker.assignedMasterclass?.masterclassName && (
                    <div className="masterclass-assignment">
                      <strong>🎤 Speaking at:</strong>
                      <p>{speaker.assignedMasterclass.masterclassName}</p>
                      <p className="timing">
                        {new Date(
                          speaker.assignedMasterclass.startTime
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {speaker.linkedin && (
                    <a
                      href={speaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {speakers.length === 0 && (
            <div className="empty-state">
              <p>No speaker information available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
