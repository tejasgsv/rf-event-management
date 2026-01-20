import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SessionCard.css';

/**
 * SessionCard Component
 *
 * Displays individual session information with:
 * - Time (start - end)
 * - Title
 * - Room/Location
 * - Session Type Badge
 * - Masterclass seat information and registration buttons
 *
 * Props:
 * - session: {
 *     id, 
 *     title, 
 *     startTime, 
 *     endTime, 
 *     room, 
 *     type, 
 *     isMasterclass, 
 *     description,
 *     totalSeats,           // from backend
 *     bookedSeats,          // from backend
 *     availableSeats,       // from backend (backend calculates this)
 *     registrationOpen      // from backend
 *   }
 * 
 * All seat info comes from backend - frontend just displays it
 */
function SessionCard({ session }) {
  const navigate = useNavigate();

  /**
   * Navigate to masterclass registration page
   */
  const handleRegister = () => {
    navigate(`/masterclass/${session.id}`);
  };

  /**
   * Navigate to session details page
   */
  const handleViewDetails = () => {
    navigate(`/masterclass/${session.id}`);
  };

  /**
   * Get badge CSS class based on session type
   */
  const getBadgeClass = (type) => {
    const badgeClasses = {
      keynote: 'badge-keynote',
      talk: 'badge-talk',
      workshop: 'badge-workshop',
      masterclass: 'badge-masterclass',
      break: 'badge-break',
    };
    return badgeClasses[type] || 'badge-default';
  };

  /**
   * Format time from "HH:MM" to "HH:MM AM/PM"
   */
  const formatTime = (time) => {
    if (!time) return 'TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  /**
   * Determine button text and state based on backend seat availability
   */
  const getButtonState = () => {
    if (!session.registrationOpen) {
      return {
        text: 'Registration Closed',
        className: 'btn-closed',
        disabled: true
      };
    }
    
    if (session.availableSeats > 0) {
      return {
        text: 'Register',
        className: 'btn-register',
        disabled: false
      };
    }
    
    // No seats available
    return {
      text: 'Join Waitlist',
      className: 'btn-waitlist',
      disabled: false
    };
  };

  const buttonState = session.isMasterclass ? getButtonState() : null;

  return (
    <div
      className={`session-card ${session.isMasterclass ? 'masterclass' : ''}`}
      role="article"
      aria-label={`${session.title} - ${formatTime(session.startTime)} to ${formatTime(session.endTime)} in ${session.room}`}
    >
      {/* Masterclass Premium Badge */}
      {session.isMasterclass && (
        <div className="masterclass-badge" aria-label="Premium Masterclass Session">
          ★ MASTERCLASS
        </div>
      )}

      {/* Time Block - Left Column */}
      <div className="session-time-block">
        <div className="session-time-range">
          <span className="session-time-start">{formatTime(session.startTime)}</span>
          <span className="session-time-separator">–</span>
          <span className="session-time-end">{formatTime(session.endTime)}</span>
        </div>
        {session.startTime && session.endTime && (
          <div className="session-duration">
            {(() => {
              try {
                const [startHour, startMin] = session.startTime.split(':').map(Number);
                const [endHour, endMin] = session.endTime.split(':').map(Number);
                const startTotal = startHour * 60 + startMin;
                const endTotal = endHour * 60 + endMin;
                const duration = endTotal - startTotal;
                return duration > 0 ? `${duration} min` : '';
              } catch (e) {
                return '';
              }
            })()}
          </div>
        )}
      </div>

      {/* Content - Middle Column */}
      <div className="session-content">
        {/* Title and Type Badge */}
        <div className="session-header">
          <h3 className="session-title">{session.title}</h3>
          <span className={`session-badge ${getBadgeClass(session.type)}`}>
            {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
          </span>
        </div>

        {/* Location and Speaker */}
        <div className="session-meta">
          <div className="session-room">
            <svg
              className="session-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7M3 7V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
            <span>{session.room || 'TBD'}</span>
          </div>
        </div>

        {/* Seat Information from Backend - Masterclasses Only */}
        {session.isMasterclass && session.totalSeats !== undefined && (
          <div className="session-seats" role="status" aria-label="Seat availability">
            <div className="seats-info">
              <span className="seat-label">Seats:</span>
              <span className="seat-value">{session.totalSeats}</span>
              <span className="seat-separator">|</span>
              <span className="seat-label">Available:</span>
              <span className={`seat-value ${session.availableSeats === 0 ? 'full' : ''}`}>
                {session.availableSeats}
              </span>
            </div>
            {session.registrationOpen ? (
              <span className="seats-status open">✓ Registration Open</span>
            ) : (
              <span className="seats-status closed">✕ Registration Closed</span>
            )}
          </div>
        )}

        {/* Description */}
        {session.description && (
          <p className="session-description">{session.description}</p>
        )}
      </div>

      {/* CTA Button - Right Column */}
      <div className="session-actions">
        {session.isMasterclass && buttonState && (
          <button
            className={`btn-action ${buttonState.className}`}
            onClick={handleRegister}
            disabled={buttonState.disabled}
            aria-label={`${buttonState.text} for ${session.title}`}
          >
            {buttonState.text}
          </button>
        )}
        {!session.isMasterclass && (
          <button
            className="btn-view-details"
            onClick={handleViewDetails}
            aria-label={`View details for ${session.title}`}
          >
            Learn More
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default SessionCard;
