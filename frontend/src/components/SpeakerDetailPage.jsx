import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import '../styles/SpeakerDetailPage.css';

/**
 * SpeakerDetailPage Component
 * Shows speaker profile, bio, and their masterclasses with timing
 */
const SpeakerDetailPage = () => {
  const { id } = useParams();
  const [speaker, setSpeaker] = useState(null);
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpeakerData();
  }, [id]);

  const loadSpeakerData = async () => {
    try {
      setLoading(true);
      
      // Fetch speaker details
      const speakerRes = await apiClient.get(`/speakers/${id}`);
      const speakerData = speakerRes.data?.data || speakerRes.data;
      setSpeaker(speakerData);

      // Fetch speaker's masterclasses
      const sessionsRes = await apiClient.get(`/sessions/speaker/${id}`);
      const sessionsList = sessionsRes.data?.data || sessionsRes.data || [];
      setMasterclasses(sessionsList);
    } catch (err) {
      console.error('Failed to load speaker:', err);
      setError('Unable to load speaker details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="speaker-detail-loading">Loading speaker profile...</div>;
  }

  if (error || !speaker) {
    return (
      <div className="speaker-detail-error">
        <h2>{error || 'Speaker not found'}</h2>
        <Link to="/speakers" className="btn-back">← Back to Speakers</Link>
      </div>
    );
  }

  return (
    <div className="speaker-detail-page">
      {/* Header */}
      <div className="speaker-detail-header">
        <Link to="/speakers" className="back-link">← Back to Speakers</Link>
      </div>

      {/* Speaker Profile Card */}
      <div className="speaker-profile-card">
        <div className="speaker-photo-section">
          {speaker.photo ? (
            <img src={speaker.photo} alt={speaker.name} className="speaker-photo-large" />
          ) : (
            <div className="speaker-avatar-large">{speaker.name?.charAt(0) || '?'}</div>
          )}
          
          {/* Social Links */}
          {(speaker.linkedin_url || speaker.twitter_url) && (
            <div className="speaker-social-links">
              {speaker.linkedin_url && (
                <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                  <span>in</span>
                </a>
              )}
              {speaker.twitter_url && (
                <a href={speaker.twitter_url} target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                  <span>𝕏</span>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="speaker-info-section">
          <h1 className="speaker-name-large">{speaker.name}</h1>
          
          {speaker.designation && (
            <p className="speaker-designation">{speaker.designation}</p>
          )}
          
          {speaker.organization && (
            <p className="speaker-organization">📍 {speaker.organization}</p>
          )}

          {speaker.bio && (
            <div className="speaker-bio-full">
              <h3>About</h3>
              <p>{speaker.bio}</p>
            </div>
          )}

          {speaker.expertise && (
            <div className="speaker-expertise">
              <h3>Expertise</h3>
              <div className="expertise-tags">
                {speaker.expertise.split(',').map((skill, idx) => (
                  <span key={idx} className="expertise-tag">{skill.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Masterclasses Section */}
      <div className="speaker-masterclasses-section">
        <h2 className="section-title">
          Masterclasses by {speaker.name.split(' ')[0]}
          {masterclasses.length > 0 && <span className="count-badge">{masterclasses.length}</span>}
        </h2>

        {masterclasses.length === 0 ? (
          <div className="no-masterclasses">
            <p>No scheduled masterclasses at the moment.</p>
          </div>
        ) : (
          <div className="masterclasses-grid">
            {masterclasses.map((session) => {
              const availableSeats = session.capacity - (session.booked_count || 0);
              const isFull = availableSeats <= 0;

              return (
                <div key={session.id} className="masterclass-card">
                  <div className="card-header">
                    <div className="time-badge">
                      🕒 {formatTime(session.start_time)}
                    </div>
                    {!isFull && availableSeats > 0 && (
                      <div className="seats-badge available">
                        {availableSeats} seats left
                      </div>
                    )}
                    {isFull && (
                      <div className="seats-badge full">Full</div>
                    )}
                  </div>

                  <h3 className="masterclass-title">{session.title}</h3>

                  <div className="masterclass-meta">
                    <div className="meta-row">
                      <span className="meta-icon">📅</span>
                      <span>{formatDate(session.start_time)}</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">⏰</span>
                      <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                    </div>
                    {session.location && (
                      <div className="meta-row">
                        <span className="meta-icon">📍</span>
                        <span>{session.location}</span>
                      </div>
                    )}
                    <div className="meta-row">
                      <span className="meta-icon">👥</span>
                      <span>{session.booked_count || 0} / {session.capacity} registered</span>
                    </div>
                  </div>

                  {session.description && (
                    <p className="masterclass-description">
                      {session.description.substring(0, 120)}...
                    </p>
                  )}

                  <Link to={`/session/${session.id}`} className="btn-view-details">
                    View Details & Register →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakerDetailPage;
