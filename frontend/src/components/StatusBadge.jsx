import React from 'react';
import PropTypes from 'prop-types';
import '../styles/StatusBadge.css';

/**
 * StatusBadge Component
 * Displays real-time availability or waitlist status
 */
const StatusBadge = ({
  capacity,
  bookedCount,
  waitlistPosition,
  registrationStatus,
  isClosed,
}) => {
  const remainingSeats = capacity - bookedCount;
  const isFull = remainingSeats <= 0;

  // Determine badge color and text
  let badgeClass = 'status-badge';
  let displayText = '';

  if (isClosed) {
    badgeClass += ' closed';
    displayText = 'Registration Closed';
  } else if (registrationStatus === 'CONFIRMED') {
    badgeClass += ' registered';
    displayText = '✓ You are registered';
  } else if (registrationStatus === 'WAITLISTED') {
    badgeClass += ' waitlisted';
    displayText = `Waitlist Position: #${waitlistPosition}`;
  } else if (isFull) {
    badgeClass += ' full';
    displayText = 'Waitlist Open';
  } else {
    badgeClass += ' available';
    displayText = `${remainingSeats} ${
      remainingSeats === 1 ? 'Seat' : 'Seats'
    } Remaining`;
  }

  return (
    <div className={badgeClass}>
      <span className="badge-text">{displayText}</span>
    </div>
  );
};

export default StatusBadge;
