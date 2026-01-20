import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "../styles/AgendaModern.css";

/* ================= HELPERS ================= */

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const now = () => new Date();

/* ================= COMPONENT ================= */

const AgendaList = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAgenda();
    // eslint-disable-next-line
  }, [eventId]);

  const loadAgenda = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      // ✅ Backend-aligned API
      const res = await apiClient.get(
        `/sessions/event/${eventId}`
      );

      const rows = res.data?.data || [];
      // Normalize backend fields to UI expectations
      const normalized = rows.map((r) => ({
        session_id: r.id,
        start_time: r.startTime,
        end_time: r.endTime,
        title: r.title,
        hall: r.location,
        capacity: r.capacity,
        booked_count: r.registered_count ?? r.bookedCount ?? 0,
        registration_close_time: r.registrationCloseTime,
        waitlist_close_time: r.waitlistCloseTime,
        speakerName: r.speakerName,
        eventId: r.eventId,
      }));

      setSessions(normalized);
    } catch (err) {
      console.error("Agenda load failed:", err);
      setError("Unable to load agenda");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= STATES ================= */

  if (loading) {
    return <div className="agenda-page">Loading agenda…</div>;
  }

  if (error) {
    return (
      <div className="agenda-page error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="agenda-page">
      {/* HEADER */}
      <div className="agenda-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="agenda-title-row">
          <div>
            <h1>Agenda</h1>
            <p className="subtitle">
              Explore sessions and register to attend
            </p>
          </div>
          <button 
            onClick={() => loadAgenda(true)} 
            className="refresh-btn"
            disabled={refreshing}
            title="Refresh agenda"
          >
            {refreshing ? '⟳' : '🔄'}
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {sessions.length === 0 && (
        <div className="agenda-empty">
          <h3>No sessions announced yet</h3>
          <p>Please check back later.</p>
        </div>
      )}

      {/* LIST */}
      <div className="agenda-list">
        {sessions.map((s) => {
          const availableSeats =
            s.capacity != null
              ? s.capacity - (s.booked_count || 0)
              : null;

          const isFull =
            availableSeats != null && availableSeats <= 0;

          const registrationClosed =
            s.registration_close_time &&
            now() >= new Date(s.registration_close_time);

          const waitlistClosed =
            s.waitlist_close_time &&
            now() >= new Date(s.waitlist_close_time);

          /* CTA LOGIC */
          let label = "Register";
          let disabled = false;
          let type = "primary";

          if (registrationClosed) {
            label = "Closed";
            disabled = true;
            type = "disabled";
          } else if (isFull && waitlistClosed) {
            label = "Waitlist Closed";
            disabled = true;
            type = "disabled";
          } else if (isFull) {
            label = "Join Waitlist";
            type = "secondary";
          }

          return (
            <div
              key={s.session_id}
              className="agenda-card"
            >
              {/* TIME */}
              <div className="agenda-time">
                {formatTime(s.start_time)}
              </div>

              {/* CONTENT */}
              <div className="agenda-content">
                <h3>{s.title}</h3>

                {s.speakerName && (
                  <p className="speaker">
                    🎤 {s.speakerName}
                  </p>
                )}

                <p className="meta">
                  {formatTime(s.start_time)} –{" "}
                  {formatTime(s.end_time)}
                  {s.hall && ` · 📍 ${s.hall}`}
                </p>

                {availableSeats != null &&
                  !registrationClosed &&
                  availableSeats > 0 && (
                    <span className="badge available">
                      {availableSeats} seats left
                    </span>
                  )}

                {!registrationClosed &&
                  isFull &&
                  !waitlistClosed && (
                    <span className="badge waitlist">
                      Waitlist Available
                    </span>
                  )}

                {registrationClosed && (
                  <span className="badge closed">
                    Registration Closed
                  </span>
                )}
              </div>

              {/* ACTION */}
              <div className="agenda-action">
                <button
                  className={`btn btn-${type}`}
                  disabled={disabled}
                  onClick={() =>
                    navigate(`/register/${s.session_id}?eventId=${eventId}`, {
                      state: { session: s },
                    })
                  }
                >
                  {label}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaList;
