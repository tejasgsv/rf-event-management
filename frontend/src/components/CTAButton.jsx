import React, { useState } from 'react';
import '../styles/CTAButton.css';

/**
 * CTAButton Component
 * Smart button that changes state based on registration status
 */
const CTAButton = ({
  state, // 'loading', 'available', 'registered', 'waitlisted', 'conflict', 'closed'
  onRegister,
  onViewQR,
  conflictSessionName,
  isOffline,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (state === 'available' && onRegister) {
      setIsProcessing(true);
      try {
        await onRegister();
      } finally {
        setIsProcessing(false);
      }
    } else if ((state === 'registered' || state === 'waitlisted') && onViewQR) {
      onViewQR();
    }
  };

  // Determine button text and styling
  const getButtonConfig = () => {
    switch (state) {
      case 'loading':
        return {
          text: 'Loading...',
          disabled: true,
          className: 'cta-button loading',
        };
      case 'available':
        return {
          text: isProcessing ? 'Processing...' : 'Register Now',
          disabled: isProcessing,
          className: 'cta-button available',
        };
      case 'registered':
        return {
          text: '✓ Registered',
          disabled: false,
          className: 'cta-button registered',
        };
      case 'waitlisted':
        return {
          text: 'View Waitlist Status',
          disabled: false,
          className: 'cta-button waitlisted',
        };
      case 'conflict':
        return {
          text: 'Schedule Conflict',
          disabled: true,
          className: 'cta-button conflict',
        };
      case 'closed':
        return {
          text: 'Registration Closed',
          disabled: true,
          className: 'cta-button closed',
        };
      case 'offline':
        return {
          text: 'Offline Mode',
          disabled: true,
          className: 'cta-button offline',
        };
      default:
        return {
          text: 'Register',
          disabled: true,
          className: 'cta-button',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="cta-container">
      <button
        className={config.className}
        onClick={handleClick}
        disabled={config.disabled}
        aria-label={config.text}
      >
        <span className="button-text">{config.text}</span>
        {isProcessing && <span className="spinner"></span>}
      </button>

      {/* Helper Messages */}
      {state === 'conflict' && conflictSessionName && (
        <p className="help-message conflict">
          ⚠ You are already registered for {conflictSessionName} at this time.
        </p>
      )}

      {state === 'closed' && (
        <p className="help-message closed">
          Online registration for this session is now closed. Please visit the
          helpdesk for last-minute inquiries.
        </p>
      )}

      {state === 'offline' && (
        <p className="help-message offline">
          Offline Mode: Showing cached schedule. QR codes are still accessible.
        </p>
      )}
    </div>
  );
};

export default CTAButton;
