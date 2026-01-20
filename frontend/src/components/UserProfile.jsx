import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../utils/apiClient';
import '../styles/UserProfile.css';

/**
 * UserProfile Component
 * Shows user info, registrations, and profile settings
 */
const UserProfile = () => {
  const { email, updateEmail, logout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    country: ''
  });

  useEffect(() => {
    if (email) {
      loadProfileData();
    } else {
      setLoading(false);
    }
  }, [email]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user registrations
      const regRes = await apiClient.get(`/sessions/users/${encodeURIComponent(email)}/registrations`);
      const regList = regRes.data?.data || regRes.data?.registrations || [];
      setRegistrations(regList);

      // Load user profile (if endpoint exists)
      try {
        const profRes = await apiClient.get(`/users/profile/${encodeURIComponent(email)}`);
        const prof = profRes.data?.data || profRes.data;
        setProfile(prof);
        setFormData({
          name: prof.name || '',
          mobile: prof.mobile || '',
          country: prof.country || ''
        });
      } catch (err) {
        // Profile endpoint might not exist yet - use defaults
        setProfile({ email });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/users/profile`, {
        email,
        ...formData
      });
      setProfile({ ...profile, ...formData });
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (!email) {
    return (
      <div className="user-profile-page">
        <div className="profile-empty">
          <div className="empty-icon">👤</div>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your profile</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  const totalSessions = registrations.length;
  const confirmedSessions = registrations.filter(r => r.status === 'CONFIRMED').length;
  const waitlistedSessions = registrations.filter(r => r.status === 'WAITLISTED').length;

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">{email.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h1>{profile?.name || email.split('@')[0]}</h1>
            <p className="profile-email">{email}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{totalSessions}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat">
                <span className="stat-value">{confirmedSessions}</span>
                <span className="stat-label">Confirmed</span>
              </div>
              {waitlistedSessions > 0 && (
                <div className="stat">
                  <span className="stat-value">{waitlistedSessions}</span>
                  <span className="stat-label">Waitlisted</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <Link to="/my-schedule" className="btn-view-schedule">
            📅 My Schedule
          </Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="profile-details-card">
        <div className="card-header">
          <h2>Profile Details</h2>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="btn-edit">
              ✏️ Edit
            </button>
          ) : (
            <button onClick={() => setEditMode(false)} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="India"
              />
            </div>
            <button type="submit" className="btn-save">Save Changes</button>
          </form>
        ) : (
          <div className="profile-details-view">
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{profile?.name || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{profile?.mobile || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Country</span>
              <span className="detail-value">{profile?.country || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Registered Sessions */}
      <div className="registered-sessions-card">
        <h2>Your Registered Sessions</h2>
        
        {registrations.length === 0 ? (
          <div className="no-registrations">
            <p>You haven't registered for any sessions yet.</p>
            <Link to="/" className="btn-browse">Browse Events</Link>
          </div>
        ) : (
          <div className="sessions-list">
            {registrations.map((reg) => {
              const dateTime = formatDateTime(reg.session_start_time || reg.start_time);
              return (
                <div key={reg.id} className="session-item">
                  <div className="session-status-badge">
                    {reg.status === 'CONFIRMED' ? (
                      <span className="badge confirmed">✓ Confirmed</span>
                    ) : (
                      <span className="badge waitlisted">⏳ Waitlisted</span>
                    )}
                  </div>
                  
                  <div className="session-info">
                    <h3>{reg.session_title || reg.title}</h3>
                    <div className="session-meta">
                      <span>📅 {dateTime.date}</span>
                      <span>⏰ {dateTime.time}</span>
                      {reg.location && <span>📍 {reg.location}</span>}
                    </div>
                  </div>

                  <div className="session-actions">
                    {reg.status === 'CONFIRMED' && reg.qr_code && (
                      <Link to={`/qr/${reg.id}`} className="btn-qr">
                        View QR Code
                      </Link>
                    )}
                    <Link to={`/session/${reg.session_id}`} className="btn-details">
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
