/**
 * Validation Utilities
 * Check 1-hour rule, schedule conflicts, and atomic lock failures
 */

/**
 * Basic field validators
 */
export const isValidEmail = (email = '') => {
  const value = String(email).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidMobile = (mobile = '') => {
  const digits = String(mobile).replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

export const isValidName = (name = '') => {
  const value = String(name).trim();
  return /^[a-zA-Z\s]+$/.test(value) && value.length >= 2;
};

export const isValidPostal = (postal = '') => {
  const value = String(postal).trim();
  return /^[a-zA-Z0-9\s]+$/.test(value) && value.length >= 2;
};

/**
 * Sanitizers
 */
export const sanitizeLettersSpaces = (value) =>
  String(value).replace(/[^a-zA-Z\s]/g, '');

export const sanitizePostal = (value) =>
  String(value).replace(/[^a-zA-Z0-9\s]/g, '');

export const sanitizeMobile = (value) =>
  String(value).replace(/[^0-9+\s]/g, '');

/**
 * Check if registration is closed (T-60 minutes rule)
 * @param {Date|string} startTime - Session start time
 * @returns {boolean} - True if registration is closed
 */
export const isRegistrationClosed = (startTime) => {
  const now = new Date();
  const sessionStart = new Date(startTime);
  const minutesUntilStart = (sessionStart - now) / (1000 * 60);
  return minutesUntilStart <= 60;
};

/**
 * Check for schedule conflicts
 * @param {Object} newSession - Session to register for { startTime, endTime }
 * @param {Array} userSchedule - Array of user's registered sessions
 * @returns {Object|null} - Conflicting session or null
 */
export const findScheduleConflict = (newSession, userSchedule = []) => {
  if (!userSchedule || userSchedule.length === 0) {
    return null;
  }

  const newStart = new Date(newSession.startTime).getTime();
  const newEnd = new Date(newSession.endTime).getTime();

  for (const existingSession of userSchedule) {
    const existingStart = new Date(existingSession.startTime).getTime();
    const existingEnd = new Date(existingSession.endTime).getTime();

    // Check if times overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      return existingSession;
    }
  }

  return null;
};

/**
 * Calculate minutes until session start
 * @param {Date|string} startTime - Session start time
 * @returns {number} - Minutes until start (negative if started)
 */
export const getMinutesUntilStart = (startTime) => {
  const now = new Date();
  const sessionStart = new Date(startTime);
  return (sessionStart - now) / (1000 * 60);
};

/**
 * Get user's schedule from localStorage
 * @returns {Array} - Array of registered sessions
 */
export const getUserSchedule = () => {
  try {
    const schedule = localStorage.getItem('userSchedule');
    return schedule ? JSON.parse(schedule) : [];
  } catch (err) {
    console.error('Error reading user schedule from storage:', err);
    return [];
  }
};

/**
 * Save user's schedule to localStorage
 * @param {Array} schedule - Sessions to save
 */
export const saveUserSchedule = (schedule) => {
  try {
    localStorage.setItem('userSchedule', JSON.stringify(schedule));
  } catch (err) {
    console.error('Error saving user schedule to storage:', err);
  }
};

/**
 * Get remaining seats
 * @param {number} capacity - Total capacity
 * @param {number} bookedCount - Number booked
 * @returns {number} - Remaining seats
 */
export const getRemainingSeats = (capacity, bookedCount) => {
  return Math.max(0, capacity - bookedCount);
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (time) => {
  return new Date(time).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if atomic lock failure (409 Conflict)
 * @param {number} status - HTTP status code
 * @returns {boolean}
 */
export const isAtomicLockFailure = (status) => {
  return status === 409;
};
