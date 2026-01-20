import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import '../styles/EventsList.css';

/**
 * EventsList Component
 * Displays all published events with masterclasses
 * Shows professional UI with event cards and masterclass listings
 */
const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [masterclasses, setMasterclasses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching all events...');
        
        const response = await apiClient.get('/events');
        console.log('✅ Events loaded:', response.data);
        
        setEvents(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch masterclasses for an event
  const fetchMasterclasses = async (eventId) => {
    if (masterclasses[eventId]) {
      // Already cached
      setExpandedEvent(expandedEvent === eventId ? null : eventId);
      return;
    }

    try {
      console.log(`🔍 Fetching masterclasses for event ${eventId}...`);
      
      const response = await apiClient.get(`/events/${eventId}/masterclasses`);
      console.log('✅ Masterclasses loaded:', response.data);
      
      setMasterclasses(prev => ({
        ...prev,
        [eventId]: response.data.data || []
      }));
      
      setExpandedEvent(eventId);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching masterclasses:', err);
      setError('Failed to load masterclasses. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventActive = (endDate) => {
    return new Date(endDate) > new Date();
  };

  if (loading) {
    return (
      <div className="events-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      {/* Header */}
      <div className="events-header">
        <h1>🎓 Events & Masterclasses</h1>
        <p>Explore upcoming professional development opportunities</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events available at this time.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              {/* Event Header */}
              <div className="event-header">
                <div className="event-title-section">
                  <h2 className="event-title">{event.name}</h2>
                  <span className={`event-badge ${isEventActive(event.end_date) ? 'active' : 'ended'}`}>
                    {isEventActive(event.end_date) ? '🟢 Active' : '⚪ Ended'}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-label">📅 Dates:</span>
                  <span className="detail-value">
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Venue:</span>
                  <span className="detail-value">{event.venue}</span>
                </div>
                {event.description && (
                  <div className="detail-item">
                    <span className="detail-label">📝 Description:</span>
                    <p className="detail-description">{event.description}</p>
                  </div>
                )}
              </div>

              {/* Toggle Masterclasses Button */}
              <button
                className={`toggle-masterclasses ${expandedEvent === event.id ? 'expanded' : ''}`}
                onClick={() => fetchMasterclasses(event.id)}
              >
                <span>
                  {expandedEvent === event.id ? '▼' : '▶'} 
                  Masterclasses ({masterclasses[event.id]?.length || 0})
                </span>
              </button>

              {/* Masterclasses List */}
              {expandedEvent === event.id && masterclasses[event.id] && (
                <div className="masterclasses-list">
                  {masterclasses[event.id].length === 0 ? (
                    <p className="no-masterclasses">No masterclasses available</p>
                  ) : (
                    masterclasses[event.id].map(masterclass => (
                      <MasterclassCard
                        key={masterclass.id}
                        masterclass={masterclass}
                        eventId={event.id}
                        onRegister={() => navigate(`/register/${masterclass.id}`)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MasterclassCard Component
 * Displays individual masterclass information with registration button
 */
const MasterclassCard = ({ masterclass, eventId, onRegister }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const availableSeats = masterclass.availableSeats || (masterclass.capacity - masterclass.bookedCount);
  const isFull = availableSeats <= 0;
  const isOpen = masterclass.isOpen !== false;

  return (
    <div className="masterclass-card">
      {/* Title and Status */}
      <div className="masterclass-header">
        <h3 className="masterclass-title">{masterclass.title}</h3>
        <div className="masterclass-status">
          <span className={`seat-badge ${isFull ? 'full' : 'available'}`}>
            {isFull ? '❌ Full' : `✅ ${availableSeats} Seats`}
          </span>
        </div>
      </div>

      {/* Description */}
      {masterclass.description && (
        <p className="masterclass-description">{masterclass.description}</p>
      )}

      {/* Details Grid */}
      <div className="masterclass-details">
        <div className="detail">
          <span className="icon">⏱️</span>
          <div>
            <span className="label">Time:</span>
            <span className="value">
              {formatTime(masterclass.startTime)} - {formatTime(masterclass.endTime)}
            </span>
          </div>
        </div>
        <div className="detail">
          <span className="icon">📍</span>
          <div>
            <span className="label">Location:</span>
            <span className="value">{masterclass.location}</span>
          </div>
        </div>
        <div className="detail">
          <span className="icon">👥</span>
          <div>
            <span className="label">Capacity:</span>
            <span className="value">{masterclass.bookedCount} / {masterclass.capacity}</span>
          </div>
        </div>
      </div>

      {/* Speakers Section */}
      {masterclass.speakers && masterclass.speakers.length > 0 && (
        <div className="speakers-section">
          <h4 className="speakers-title">🎤 Speakers</h4>
          <div className="speakers-list">
            {masterclass.speakers.map(speaker => (
              <div key={speaker.id} className="speaker-item">
                <img 
                  src={speaker.photo} 
                  alt={speaker.name}
                  className="speaker-photo"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=random`;
                  }}
                />
                <div className="speaker-info">
                  <div className="speaker-name">{speaker.name}</div>
                  <div className="speaker-title">{speaker.title || speaker.designation}</div>
                  {speaker.organization && (
                    <div className="speaker-org">{speaker.organization}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        className={`register-button ${!isOpen || isFull ? 'disabled' : ''}`}
        onClick={onRegister}
        disabled={!isOpen || isFull}
      >
        {!isOpen ? '❌ Registration Closed' : isFull ? '❌ No Seats Available' : '📋 Register Now'}
      </button>
    </div>
  );
};

export default EventsList;
