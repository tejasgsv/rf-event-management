import React from 'react';
import '../styles/SessionDetailsModals.css';

/**
 * WaitlistModal Component
 * Shown when atomic lock fails (last seat taken)
 */
export const WaitlistModal = ({ isOpen, onClose, onJoinWaitlist }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content waitlist-modal">
        <h2>Oops! That was close.</h2>
        <p className="modal-message">
          The last seat was just taken by another attendee. Would you like to
          join the waitlist instead?
        </p>
        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            No, Thanks
          </button>
          <button
            className="btn-primary"
            onClick={onJoinWaitlist}
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * OfflineModal Component
 * Shown when there's a network error
 */
export const OfflineModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content error-modal">
        <h2>Connection Issue</h2>
        <p className="modal-message">
          {errorMessage || 'Unable to connect to the server. Please try again.'}
        </p>
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={onClose}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * SuccessModal Component
 * Shown after successful registration
 */
export const SuccessModal = ({ isOpen, onClose, qrCode, masterclassTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content success-modal">
        <div className="success-icon">✓</div>
        <h2>Registration Confirmed!</h2>
        <p className="modal-message">
          You are now registered for <strong>{masterclassTitle}</strong>
        </p>
        {qrCode && (
          <div className="qr-display">
            <p>Your QR Code:</p>
            <img src={qrCode} alt="Registration QR Code" />
          </div>
        )}
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={onClose}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * WaitlistPromotionNotification Component
 * Shown as toast when user is promoted from waitlist
 */
export const WaitlistPromotionNotification = ({ isVisible, masterclassTitle }) => {
  if (!isVisible) return null;

  return (
    <div className="promotion-notification">
      <div className="notification-content">
        <span className="notification-icon">🎉</span>
        <div>
          <p className="notification-title">You've been promoted!</p>
          <p className="notification-message">
            A seat opened in {masterclassTitle}. Your QR code is now active.
          </p>
        </div>
      </div>
    </div>
  );
};
