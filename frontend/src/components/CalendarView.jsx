import React, { useMemo } from 'react';
import '../styles/CalendarView.css';

/**
 * CalendarView Component
 * 
 * Displays a monthly calendar showing event date range.
 * 
 * Features:
 * - Shows month/year navigation
 * - Highlights event dates with indicators
 * - Displays session count and Masterclass badges
 * - Disables non-event dates (visual greying)
 * - Click handler for date selection
 * 
 * Props:
 * - currentMonth: Date object for the month to display
 * - onMonthChange: (newDate) => void - Handle month navigation
 * - eventDates: Array of date objects with events
 * - selectedDate: Currently selected date
 * - onSelectDate: (date) => void - Handle date selection
 * - getSessionsForDate: (date) => Array - Get sessions for a date
 */
function CalendarView({
  currentMonth,
  onMonthChange,
  eventDates,
  selectedDate,
  onSelectDate,
  getSessionsForDate,
}) {
  // Helper: Create array of Date objects for all days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper: Get day of week for first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Helper: Format date as YYYY-MM-DD for comparison
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Helper: Check if date is an event date
  const isEventDate = (dayNumber) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    const dateKey = formatDateKey(date);
    return eventDates.some((eventDate) => formatDateKey(eventDate) === dateKey);
  };

  // Helper: Check if date is selected
  const isSelectedDate = (dayNumber) => {
    if (!selectedDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    const dateKey = formatDateKey(date);
    return formatDateKey(selectedDate) === dateKey;
  };

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      days.push(dayNumber);
    }

    return days;
  }, [currentMonth]);

  // Helper: Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Helper: Get previous month
  const getPreviousMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  };

  // Helper: Get next month
  const getNextMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  };

  // Helper: Get session stats for a date
  const getSessionStats = (dayNumber) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
    const sessions = getSessionsForDate(date);
    const masterclassCount = sessions.filter((s) => s.isMasterclass).length;
    const regularCount = sessions.length - masterclassCount;
    return { total: sessions.length, masterclassCount, regularCount };
  };

  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav-button calendar-prev"
          onClick={() => onMonthChange(getPreviousMonth())}
          aria-label="Previous month"
        >
          ‹
        </button>

        <h2 className="calendar-month-year">{formatMonthYear(currentMonth)}</h2>

        <button
          className="calendar-nav-button calendar-next"
          onClick={() => onMonthChange(getNextMonth())}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid" role="grid">
        {calendarGrid.map((dayNumber, index) => {
          if (dayNumber === null) {
            return (
              <div key={`empty-${index}`} className="calendar-cell calendar-empty" />
            );
          }

          const isEvent = isEventDate(dayNumber);
          const isSelected = isSelectedDate(dayNumber);
          const stats = isEvent ? getSessionStats(dayNumber) : null;

          return (
            <button
              key={dayNumber}
              className={`calendar-cell ${isEvent ? 'calendar-event-date' : 'calendar-non-event'} ${
                isSelected ? 'calendar-selected' : ''
              }`}
              onClick={() => {
                if (isEvent) {
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    dayNumber
                  );
                  onSelectDate(date);
                }
              }}
              disabled={!isEvent}
              aria-label={`${dayNumber} ${formatMonthYear(currentMonth)} ${
                isEvent ? `${stats.total} sessions` : 'no events'
              }`}
              role="gridcell"
            >
              {/* Day Number */}
              <div className="calendar-cell-date">{dayNumber}</div>

              {/* Session Indicators (only for event dates) */}
              {isEvent && stats && (
                <div className="calendar-cell-indicators">
                  {/* Regular Sessions Dots */}
                  {stats.regularCount > 0 && (
                    <div className="indicator-dots">
                      {Array(Math.min(stats.regularCount, 2))
                        .fill(null)
                        .map((_, i) => (
                          <span key={`dot-${i}`} className="indicator-dot" title="Session" />
                        ))}
                      {stats.regularCount > 2 && (
                        <span className="indicator-overflow">+{stats.regularCount - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Masterclass Badges */}
                  {stats.masterclassCount > 0 && (
                    <div className="indicator-masterclass">
                      {Array(Math.min(stats.masterclassCount, 2))
                        .fill(null)
                        .map((_, i) => (
                          <span
                            key={`mc-${i}`}
                            className="indicator-badge-mc"
                            title="Masterclass"
                          >
                            ◆
                          </span>
                        ))}
                      {stats.masterclassCount > 2 && (
                        <span className="indicator-mc-count">+{stats.masterclassCount - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Mini Summary */}
                  <div className="calendar-cell-summary">
                    <span className="summary-count">{stats.total}</span>
                    {stats.masterclassCount > 0 && (
                      <span className="summary-mc-label">
                        {stats.masterclassCount > 1 ? `${stats.masterclassCount}mc` : 'mc'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-icon legend-dot" />
          <span className="legend-text">Sessions</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon legend-mc">◆</span>
          <span className="legend-text">Masterclass</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
