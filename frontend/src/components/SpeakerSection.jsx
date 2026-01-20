import React, { useState, useEffect } from 'react';
import '../styles/SpeakerSection.css';

/**
 * SpeakerSection Component
 * Displays speaker profile with expandable bio
 * Implements line clamp to prevent layout shift
 */
const SpeakerSection = ({ speakers = [] }) => {
  const [expandedSpeaker, setExpandedSpeaker] = useState(null);

  if (!speakers || speakers.length === 0) {
    return null;
  }

  const toggleBioExpand = (speakerId) => {
    setExpandedSpeaker(expandedSpeaker === speakerId ? null : speakerId);
  };

  return (
    <section className="speaker-section">
      <h2 className="speaker-section-title">Instructors</h2>
      <div className="speakers-container">
        {speakers.map((speaker) => (
          <div key={speaker.id} className="speaker-card">
            {/* Speaker Avatar */}
            <div className="speaker-avatar">
              <img
                src={speaker.headshot || '/images/placeholder-speaker.png'}
                alt={speaker.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-speaker.png';
                }}
              />
            </div>

            {/* Speaker Info */}
            <div className="speaker-info">
              <h3 className="speaker-name">{speaker.name}</h3>
              {speaker.title && <p className="speaker-title">{speaker.title}</p>}

              {/* Bio with Line Clamp */}
              <div
                className={`speaker-bio ${
                  expandedSpeaker === speaker.id ? 'expanded' : 'collapsed'
                }`}
              >
                <p className="bio-text">{speaker.bio}</p>
              </div>

              {/* Read More Toggle */}
              {speaker.bio && speaker.bio.length > 150 && (
                <button
                  className="read-more-btn"
                  onClick={() => toggleBioExpand(speaker.id)}
                  aria-expanded={expandedSpeaker === speaker.id}
                >
                  {expandedSpeaker === speaker.id ? 'Read Less' : 'Read More'}
                </button>
              )}

              {/* Social Links */}
              {(speaker.linkedIn || speaker.twitter) && (
                <div className="speaker-social">
                  {speaker.linkedIn && (
                    <a
                      href={speaker.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="social-link linkedin"
                    >
                      <i className="icon-linkedin"></i>
                    </a>
                  )}
                  {speaker.twitter && (
                    <a
                      href={speaker.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter"
                      className="social-link twitter"
                    >
                      <i className="icon-twitter"></i>
                    </a>
                  )}
                </div>
              )}

              {/* Related Sessions (if available) */}
              {speaker.otherSessions && speaker.otherSessions.length > 0 && (
                <div className="related-sessions">
                  <p className="related-label">Other sessions by {speaker.name.split(' ')[0]}:</p>
                  <ul>
                    {speaker.otherSessions.slice(0, 2).map((session) => (
                      <li key={session.id}>
                        <a href={`/masterclass/${session.id}`}>{session.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SpeakerSection;
