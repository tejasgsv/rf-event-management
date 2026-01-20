import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CalendarView from "./CalendarView";
import "../styles/AgendaCalendar.css";
import apiClient from "../utils/apiClient";

function AgendaCalendar() {
  const { eventId } = useParams();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // ================= FETCH MASTERCLASSES =================
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);

        const res = await apiClient.get(
          `/masterclasses/event/${eventId}`
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        setSessions(data);

        if (data.length > 0) {
          const first = new Date(data[0].startTime);
          setSelectedDate(first);
          setCurrentMonth(
            new Date(first.getFullYear(), first.getMonth(), 1)
          );
        }
      } catch (err) {
        console.error("Agenda fetch failed:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [eventId]);

  // ================= DATE LIST =================
  const eventDates = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => {
      if (s.startTime) {
        set.add(new Date(s.startTime).toISOString().split("T")[0]);
      }
    });
    return Array.from(set).map((d) => new Date(d));
  }, [sessions]);

  const sessionsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().split("T")[0];
    return sessions.filter(
      (s) =>
        s.startTime &&
        new Date(s.startTime).toISOString().split("T")[0] === key
    );
  }, [selectedDate, sessions]);

  // ================= UI =================
  if (loading) {
    return (
      <div className="agenda-page">
        <h2>Event Agenda</h2>
        <p>Loading agenda…</p>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      {/* HEADER */}
      <div className="agenda-header">
        <h1>Event Agenda</h1>
        <p>Select date to view sessions</p>
      </div>

      {/* CALENDAR */}
      <div className="agenda-calendar-wrapper">
        <CalendarView
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          eventDates={eventDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* MASTERCLASS LIST */}
      <div className="agenda-list">
        {sessionsForDate.length === 0 ? (
          <div className="agenda-empty">
            <p>No sessions on this date.</p>
          </div>
        ) : (
          sessionsForDate.map((s) => (
            <div key={s.id} className="agenda-card">
              <div className="agenda-time">
                {new Date(s.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(s.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <h3 className="agenda-title">{s.title}</h3>

              {s.location && (
                <p className="agenda-location">📍 {s.location}</p>
              )}

              <div className="agenda-actions">
                <Link
                  to={`/register/${eventId}/${s.id}`}
                  className="btn-primary"
                >
                  Register
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AgendaCalendar;
