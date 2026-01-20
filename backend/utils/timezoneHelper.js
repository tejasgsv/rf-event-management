/**
 * Timezone-Safe Registration Gate Logic
 * Ensures 1-hour rule is calculated using Venue Local Time, not server time
 * Uses Luxon for robust timezone handling
 */

const { DateTime, Interval } = require('luxon');

/**
 * isRegistrationClosedForVenue
 * @param {string} sessionStartTimeUTC - ISO 8601 UTC timestamp from DB
 * @param {string} venueTimezone - IANA timezone (e.g., "Asia/Dubai", "Asia/Kolkata")
 * @returns {object} { isClosed: boolean, reason: string, timeRemaining: number (seconds), localTime: string }
 */
const isRegistrationClosedForVenue = (sessionStartTimeUTC, venueTimezone) => {
  try {
    // Parse the UTC session start time
    const sessionStartUTC = DateTime.fromISO(sessionStartTimeUTC, { zone: 'utc' });
    
    // Convert to venue's local time
    const sessionStartLocal = sessionStartUTC.setZone(venueTimezone);
    
    // One hour before session start (in venue time)
    const registrationCutoffLocal = sessionStartLocal.minus({ hours: 1 });
    
    // Current time in venue's timezone
    const nowLocal = DateTime.now().setZone(venueTimezone);
    
    // Check if we've passed the cutoff
    const isClosed = nowLocal >= registrationCutoffLocal;
    
    // Calculate time remaining
    const interval = Interval.fromDateTimes(nowLocal, registrationCutoffLocal);
    const timeRemainingSeconds = isClosed ? 0 : Math.ceil(interval.length('seconds'));
    
    return {
      isClosed,
      reason: isClosed 
        ? `Registration closed. Session starts at ${sessionStartLocal.toFormat('HH:mm:ss')} (${venueTimezone})`
        : `Registration open. Closes at ${registrationCutoffLocal.toFormat('HH:mm:ss')} (${venueTimezone})`,
      timeRemaining: timeRemainingSeconds,
      localTime: nowLocal.toISO(),
      sessionStartLocal: sessionStartLocal.toISO(),
      cutoffTimeLocal: registrationCutoffLocal.toISO()
    };
  } catch (err) {
    console.error('Timezone calculation error:', err);
    // Fallback to UTC if timezone is invalid
    return {
      isClosed: false,
      reason: 'Timezone calculation failed, using UTC fallback',
      timeRemaining: 0,
      error: err.message
    };
  }
};

/**
 * getVenueLocalTime
 * Convert any UTC timestamp to venue local time
 */
const getVenueLocalTime = (utcTimestamp, venueTimezone) => {
  try {
    const utc = DateTime.fromISO(utcTimestamp, { zone: 'utc' });
    const local = utc.setZone(venueTimezone);
    return {
      isoLocal: local.toISO(),
      formatted: local.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'),
      timestamp: local.toMillis()
    };
  } catch (err) {
    console.error('Timezone conversion error:', err);
    return null;
  }
};

/**
 * validateTimezoneString
 * Check if timezone is valid IANA timezone
 */
const validateTimezoneString = (timezoneStr) => {
  try {
    DateTime.now().setZone(timezoneStr);
    return { valid: true, timezone: timezoneStr };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

/**
 * Common timezone constants for quick reference
 */
const COMMON_TIMEZONES = {
  DUBAI: 'Asia/Dubai',      // GST (UTC+4)
  INDIA: 'Asia/Kolkata',    // IST (UTC+5:30)
  LONDON: 'Europe/London',  // GMT/BST
  NEWYORK: 'America/New_York', // EST/EDT
  TOKYO: 'Asia/Tokyo',      // JST (UTC+9)
  SYDNEY: 'Australia/Sydney' // AEDT/AEST
};

module.exports = {
  isRegistrationClosedForVenue,
  getVenueLocalTime,
  validateTimezoneString,
  COMMON_TIMEZONES,
  DateTime,
  Interval
};
