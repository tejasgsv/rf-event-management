import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../utils/apiClient';
import '../styles/EventFeedback.css';

/**
 * EventFeedback Component
 * Allows users to submit feedback and see event ratings
 */
const EventFeedback = () => {
  const { eventId } = useParams();
  const { email } = useContext(UserContext);
  
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    experience: 'excellent',
    comment: '',
    recommendations: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingFeedback, setExistingFeedback] = useState([]);

  useEffect(() => {
    loadEventData();
    loadFeedbackData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const res = await apiClient.get(`/events/${eventId}`);
      setEvent(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load event:', err);
    }
  };

  const loadFeedbackData = async () => {
    try {
      const res = await apiClient.get(`/feedback/event/${eventId}`);
      const list = res.data?.data || res.data || [];
      setExistingFeedback(list);
    } catch (err) {
      console.log('No feedback data available');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please log in to submit feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/feedback', {
        eventId,
        email,
        ...feedback
      });
      
      setSubmitted(true);
      setTimeout(() => {
        loadFeedbackData();
        setFeedback({ rating: 5, experience: 'excellent', comment: '', recommendations: '' });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const averageRating = existingFeedback.length > 0
    ? (existingFeedback.reduce((sum, f) => sum + f.rating, 0) / existingFeedback.length).toFixed(1)
    : 0;

  return (
    <div className="event-feedback-page">
      {/* Header */}
      <div className="feedback-header">
        <h1>Event Feedback</h1>
        {event && <p className="event-name">{event.name || event.eventtitle}</p>}
        
        {existingFeedback.length > 0 && (
          <div className="rating-summary">
            <div className="avg-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(averageRating) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-count">({existingFeedback.length} reviews)</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Form */}
      <div className="feedback-form-section">
        <h2>Share Your Experience</h2>
        
        {submitted && (
          <div className="success-message">
            ✓ Thank you for your feedback! Your input helps us improve future events.
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Rating */}
          <div className="form-group">
            <label>Overall Rating *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${feedback.rating >= star ? 'active' : ''}`}
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                >
                  ★
                </button>
              ))}
              <span className="rating-label">
                {feedback.rating === 5 ? 'Excellent' :
                 feedback.rating === 4 ? 'Very Good' :
                 feedback.rating === 3 ? 'Good' :
                 feedback.rating === 2 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>

          {/* Experience */}
          <div className="form-group">
            <label>How was your experience? *</label>
            <select
              value={feedback.experience}
              onChange={(e) => setFeedback({ ...feedback, experience: e.target.value })}
              required
            >
              <option value="excellent">Excellent - Exceeded expectations</option>
              <option value="good">Good - Met expectations</option>
              <option value="average">Average - Satisfactory</option>
              <option value="poor">Poor - Below expectations</option>
            </select>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label>What did you like most? *</label>
            <textarea
              rows="4"
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              placeholder="Share your thoughts about the sessions, speakers, organization..."
              required
            />
          </div>

          {/* Recommendations */}
          <div className="form-group">
            <label>Suggestions for improvement</label>
            <textarea
              rows="3"
              value={feedback.recommendations}
              onChange={(e) => setFeedback({ ...feedback, recommendations: e.target.value })}
              placeholder="How can we make future events even better?"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || !email}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {!email && (
            <p className="login-prompt">Please <a href="/login">log in</a> to submit feedback</p>
          )}
        </form>
      </div>

      {/* Recent Feedback */}
      {existingFeedback.length > 0 && (
        <div className="feedback-list-section">
          <h2>What Others Are Saying</h2>
          <div className="feedback-list">
            {existingFeedback.slice(0, 10).map((item, idx) => (
              <div key={idx} className="feedback-item">
                <div className="feedback-header-row">
                  <div className="user-info">
                    <div className="user-avatar">{item.email?.charAt(0).toUpperCase() || '?'}</div>
                    <div>
                      <p className="user-email">{item.email?.replace(/(.{3}).*(@.*)/, '$1***$2') || 'Anonymous'}</p>
                      <div className="feedback-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < item.rating ? 'star filled' : 'star'}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="feedback-date">
                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <p className="feedback-comment">{item.comment}</p>
                {item.recommendations && (
                  <p className="feedback-recommendations">
                    <strong>Suggestions:</strong> {item.recommendations}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFeedback;
