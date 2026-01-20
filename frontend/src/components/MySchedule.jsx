import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRegistrations } from "../utils/publicService";
import { isValidEmail } from "../utils/validationUtils";
import "../styles/MySchedule.css";

/* ================= COMPONENT ================= */

const MySchedule = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  /* ================= SEARCH ================= */

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email || loading) return;

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setRegistrations([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");
    setRegistrations([]);
    setSearched(true);

    try {
      const res = await getUserRegistrations(
        email.trim().toLowerCase()
      );

      if (Array.isArray(res?.registrations)) {
        setRegistrations(res.registrations);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      setError("No registrations found for this email.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="my-schedule">
      <h1>My Schedule</h1>
      <p className="subtitle">
        Enter your email to view your registered sessions and QR codes
      </p>

      {/* SEARCH FORM */}
      <form className="schedule-form" onSubmit={handleSearch}>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find"}
        </button>
      </form>

      {/* ERROR */}
      {error && <p className="error-text">{error}</p>}

      {/* EMPTY STATE */}
      {searched && !loading && registrations.length === 0 && !error && (
        <p className="empty-text">No registrations found.</p>
      )}

      {/* REGISTRATION LIST */}
      {registrations.length > 0 && (
        <div className="schedule-list">
          {registrations.map((reg) => (
            <div key={reg.registrationId} className="schedule-card">
              <div className="schedule-details">
                <h3>{reg.sessionTitle || "Session"}</h3>

                <p className="event-name">
                  {reg.eventtitle || "Event"}
                </p>

                {/* STATUS */}
                <span
                  className={`status-badge ${reg.status.toLowerCase()}`}
                >
                  {reg.status}
                </span>

                {/* CONFIRMED */}
                {reg.status === "CONFIRMED" && reg.qrCode && (
                  <button
                    className="view-qr-btn"
                    onClick={() =>
                      navigate(`/qr/${reg.registrationId}`, {
                        state: reg, // cache QR data
                      })
                    }
                  >
                    View QR Code
                  </button>
                )}

                {/* WAITLISTED */}
                {reg.status === "WAITLISTED" && (
                  <p className="waitlist-note">
                    ⏳ You are on the waitlist.  
                    You’ll be notified automatically if a seat opens.
                  </p>
                )}

                {/* CANCELLED (future-safe) */}
                {reg.status === "CANCELLED" && (
                  <p className="cancelled-note">
                    ❌ This registration was cancelled.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySchedule;
