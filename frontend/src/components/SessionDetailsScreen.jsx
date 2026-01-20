import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useSessionData } from '../hooks/useSessionData';
import {
  isRegistrationClosed,
  findScheduleConflict,
  getUserSchedule,
  saveUserSchedule,
  formatTime,
  isAtomicLockFailure,
} from '../utils/validationUtils';
import SpeakerSection from './SpeakerSection';
import StatusBadge from './StatusBadge';
import CTAButton from './CTAButton';
import {
  WaitlistModal,
  OfflineModal,
  WaitlistPromotionNotification,
} from './SessionDetailsModals';
import '../styles/SessionDetailsScreen.css';

/**
 * SessionDetailsScreen Component
 * The Details Screen is the bridge between user request and database rules
 * Implements: Hybrid caching, 1-hour rule, atomic lock handling, schedule conflicts
 */
const SessionDetailsScreen = () => {
  const { id: masterclassId } = useParams();
  const navigate = useNavigate();
  const { email } = useContext(UserContext);

  // Data fetching
  const {
    sessionData,
    speakers,
    loading,
    error,
    registrationStatus,
    waitlistPosition,
    refetchStatus,
  } = useSessionData(masterclassId);

  // Local state for UI
  const [state, setState] = useState('loading'); // 'loading', 'available', 'registered', 'waitlisted', 'conflict', 'closed'
  const [conflictSession, setConflictSession] = useState(null);
  const [isClosed, setIsClosed] = useState(false);

  // Modal states
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showPromotionNotification, setShowPromotionNotification] =
    useState(false);
  const [offlineErrorMessage, setOfflineErrorMessage] = useState('');

  // Timer for 1-hour rule
  useEffect(() => {
    if (!sessionData) return;

    const checkRegistrationStatus = () => {
      const closed = isRegistrationClosed(sessionData.startTime);
      setIsClosed(closed);
    };

    // Check immediately
    checkRegistrationStatus();

    // Set up interval to check every minute
    const interval = setInterval(checkRegistrationStatus, 60000);

    return () => clearInterval(interval);
  }, [sessionData]);

  // Determine current state
  useEffect(() => {
    if (loading) {
      setState('loading');
      return;
    }

    if (!sessionData) {
      setState('closed');
      return;
    }

    // Check if registration is closed
    if (isClosed) {
      setState('closed');
      return;
    }

    // Check if user is already registered
    if (registrationStatus === 'CONFIRMED') {
      setState('registered');
      return;
    }

    // Check if user is on waitlist
    if (registrationStatus === 'WAITLISTED') {
      setState('waitlisted');
      return;
    }

    // Check for schedule conflicts (informational only)
    if (email) {
      const userSchedule = getUserSchedule();
      const conflict = findScheduleConflict(sessionData, userSchedule);
      setConflictSession(conflict || null);
    }

    // Default: available
    setState('available');
  }, [loading, sessionData, registrationStatus, isClosed, email]);

  // Registration handler
  const handleRegister = () => {
    navigate(`/register/${masterclassId}`);
  };

  // Join waitlist handler
  const handleJoinWaitlist = async () => {
    setShowWaitlistModal(false);
    setIsProcessing(true);

    try {
      const response = await apiClient.post(
        `/sessions/${masterclassId}/register`,
        {
          masterclassId,
          name: firstName || 'Guest',
          surname: lastName || '',
          email: email || emailInput,
          mobile: mobile || 'N/A',
          country: country || 'India',
        }
      );

      setState('waitlisted');
      setShowWaitlistModal(false);
      refetchStatus();
    } catch (err) {
      setOfflineErrorMessage('Failed to join waitlist');
      setShowOfflineModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // View QR code handler
  const handleViewQR = () => {
    navigate('/my-schedule');
  };

  if (error) {
    return (
      <div className="session-details-error">
        <h2>Unable to Load Session</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="session-details-container">
      {/* Header Section */}
      <header className="session-header">
        <div className="header-content">
          {loading ? (
            <div className="skeleton-loader">Loading...</div>
          ) : (
            <>
              <h1 className="session-title">{sessionData?.title}</h1>
              <div className="header-meta">
                <span className="meta-item">
                  📍 {sessionData?.location}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-item">
                  🕒 {formatTime(sessionData?.startTime)} -{' '}
                  {new Date(sessionData?.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="session-details-content">
        {/* Status Badge */}
        <div className="status-section">
          <StatusBadge
            capacity={sessionData?.capacity || 0}
            bookedCount={sessionData?.bookedCount || 0}
            waitlistPosition={waitlistPosition}
            registrationStatus={registrationStatus}
            isClosed={isClosed}
          />
        </div>

        {/* Description Section */}
        <section className="description-section">
          <h2>About This Session</h2>
          <p className="session-description">{sessionData?.description}</p>
        </section>

        {/* Speaker Section */}
        <SpeakerSection speakers={speakers} />

        {/* Additional Details */}
        <section className="additional-details">
          <div className="detail-grid">
            <div className="detail-item">
              <h3>Capacity</h3>
              <p>{sessionData?.capacity} attendees</p>
            </div>
            <div className="detail-item">
              <h3>Currently Booked</h3>
              <p>{sessionData?.bookedCount} registered</p>
            </div>
            <div className="detail-item">
              <h3>Available Seats</h3>
              <p>
                {Math.max(0, (sessionData?.capacity || 0) - (sessionData?.bookedCount || 0))}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA Button Footer */}
      <footer className="cta-footer">
        <div className="cta-footer-content">
          <CTAButton
            state={state}
            onRegister={handleRegister}
            onViewQR={handleViewQR}
            conflictSessionName={conflictSession?.title}
            isOffline={showOfflineModal}
          />
        </div>
      </footer>

      {/* Modals */}
      <WaitlistModal
        isOpen={false}
        onClose={() => setShowWaitlistModal(false)}
        onJoinWaitlist={() => {}}
      />

      <OfflineModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        errorMessage={offlineErrorMessage}
      />

      <WaitlistPromotionNotification
        isVisible={showPromotionNotification}
        masterclassTitle={sessionData?.title}
      />
    </div>
  );
};

export default SessionDetailsScreen;
