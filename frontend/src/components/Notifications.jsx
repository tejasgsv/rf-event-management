import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import apiClient from '../utils/apiClient';
import '../styles/Notifications.css';

/**
 * Notifications Component
 * Displays user notifications for registrations, waitlist updates, event changes
 */
const Notifications = () => {
  const { email } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    if (email) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [email]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/notifications/user/${encodeURIComponent(email)}`);
      const list = res.data?.data || res.data || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      // Mock notifications for demo
      setNotifications([
        {
          id: 1,
          type: 'registration',
          title: 'Registration Confirmed',
          message: 'You are registered for "Digital Transformation Strategy"',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/my-schedule'
        },
        {
          id: 2,
          type: 'waitlist',
          title: 'Waitlist Update',
          message: 'You have been promoted from waitlist to confirmed for "AI in Business"',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          link: '/my-schedule'
        },
        {
          id: 3,
          type: 'reminder',
          title: 'Session Starting Soon',
          message: 'Your session starts in 30 minutes. Check your QR code.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          link: '/my-schedule'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(`/notifications/user/${encodeURIComponent(email)}/read-all`);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'registration': return '✓';
      case 'waitlist': return '⏳';
      case 'reminder': return '🔔';
      case 'update': return 'ℹ️';
      case 'cancellation': return '⚠️';
      default: return '📬';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!email) {
    return (
      <div className="notifications-page">
        <div className="notifications-empty">
          <div className="empty-icon">🔔</div>
          <h2>Sign In Required</h2>
          <p>Please sign in to view your notifications</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} new</span>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="header-actions">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-read">
                Mark all as read
              </button>
            )}
            <button onClick={clearAll} className="btn-clear">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="filter-tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`tab ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-icon">📭</div>
          <h2>No notifications</h2>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-icon">{getIcon(notification.type)}</div>
              
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
              </div>

              {notification.link && (
                <Link to={notification.link} className="notification-action">
                  View →
                </Link>
              )}

              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
