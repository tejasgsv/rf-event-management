import React from "react";
import { useNavigate } from "react-router-dom";
import SessionCard from "./SessionCard";
import "../styles/SessionListByDate.css";

function SessionListByDate({ selectedDate, sessions, onDateChange }) {
  const navigate = useNavigate();

  const formatDateHeader = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  // 🔥 Masterclass first, then time
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isMasterclass && !b.isMasterclass) return -1;
    if (!a.isMasterclass && b.isMasterclass) return 1;
    return new Date(a.startTime) - new Date(b.startTime);
  });

  const goToPreviousDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  return (
    <div className="session-list-by-date">
      {/* HEADER */}
      <div className="session-list-header">
        <button onClick={goToPreviousDay}>‹</button>

        <h2>{formatDateHeader(selectedDate)}</h2>

        <button onClick={goToNextDay}>›</button>
      </div>

      {/* SESSIONS */}
      {sortedSessions.length === 0 ? (
        <div className="no-sessions-placeholder">
          <p>No sessions for this day</p>
        </div>
      ) : (
        <div className="sessions-container">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`session-wrapper ${
                session.isMasterclass ? "clickable" : ""
              }`}
              onClick={() => {
                if (session.isMasterclass) {
                  navigate(`/masterclass/${session.id}`);
                }
              }}
            >
              <SessionCard session={session} />

              {session.isMasterclass && (
                <div className="masterclass-cta">
                  View Masterclass →
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionListByDate;
