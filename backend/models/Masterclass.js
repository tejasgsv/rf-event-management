/**
 * Masterclass Model (Sessions Table)
 * Handles CRUD operations for sessions/masterclasses
 * 
 * Database: sessions table with snake_case columns
 * - session_id, event_id, speaker_id, title, session_type
 * - start_time, end_time, hall, description, capacity
 * - registration_close_time, waitlist_close_time, status
 */

const db = require('../config/database');

class Masterclass {
  /**
   * Get all masterclasses/sessions
   */
  static async find(options = {}) {
    let sql = `SELECT * FROM sessions`;
    const params = [];

    if (options.event_id) {
      sql += ` WHERE event_id = ?`;
      params.push(options.event_id);
    }

    sql += ` ORDER BY start_time ASC`;

    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    return await db.getAll(sql, params);
  }

  /**
   * Get masterclass by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM sessions WHERE session_id = ?`;
    return await db.getOne(sql, [id]);
  }

  /**
   * Find by event ID
   */
  static async findByEventId(eventId, options = {}) {
    const sql = `
      SELECT * FROM sessions
      WHERE event_id = ?
      ORDER BY start_time ASC
      LIMIT ? OFFSET ?
    `;
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    return await db.getAll(sql, [eventId, limit, skip]);
  }

  /**
   * Create masterclass/session
   */
  static async create(data) {
    const sql = `
      INSERT INTO sessions 
      (event_id, speaker_id, title, session_type, start_time, end_time, 
       hall, description, capacity, registration_close_time, waitlist_close_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sessionId = await db.insert(sql, [
      data.event_id,
      data.speaker_id || null,
      data.title,
      data.session_type || 'keynote',
      data.start_time,
      data.end_time,
      data.hall || null,
      data.description || null,
      data.capacity || 0,
      data.registration_close_time || data.start_time,
      data.waitlist_close_time || data.start_time,
      data.status || 'DRAFT'
    ]);

    return { session_id: sessionId, ...data };
  }

  /**
   * Update masterclass
   */
  static async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(data.start_time);
    }
    if (data.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(data.end_time);
    }
    if (data.hall !== undefined) {
      updates.push('hall = ?');
      values.push(data.hall);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(data.capacity);
    }
    if (data.session_type !== undefined) {
      updates.push('session_type = ?');
      values.push(data.session_type);
    }
    if (data.speaker_id !== undefined) {
      updates.push('speaker_id = ?');
      values.push(data.speaker_id);
    }
    if (data.registration_close_time !== undefined) {
      updates.push('registration_close_time = ?');
      values.push(data.registration_close_time);
    }
    if (data.waitlist_close_time !== undefined) {
      updates.push('waitlist_close_time = ?');
      values.push(data.waitlist_close_time);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE sessions SET ${updates.join(', ')} WHERE session_id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  }

  /**
   * Delete masterclass
   */
  static async findByIdAndDelete(id) {
    const session = await this.findById(id);
    if (session) {
      await db.query(`DELETE FROM sessions WHERE session_id = ?`, [id]);
    }
    return session;
  }

  /**
   * Get session with speaker details
   */
  static async findByIdWithSpeaker(id) {
    const sql = `
      SELECT 
        s.*,
        sp.full_name as speaker_name,
        sp.bio as speaker_bio
      FROM sessions s
      LEFT JOIN speakers sp ON s.speaker_id = sp.speaker_id
      WHERE s.session_id = ?
    `;
    return await db.getOne(sql, [id]);
  }

  /**
   * Get all sessions for event with speaker details
   */
  static async findByEventIdWithSpeakers(eventId) {
    const sql = `
      SELECT 
        s.*,
        sp.full_name as speaker_name,
        sp.bio as speaker_bio,
        (SELECT COUNT(*) FROM registrations WHERE session_id = s.session_id AND status = 'confirmed') as booked_count,
        (SELECT COUNT(*) FROM waitlist WHERE event_id = ? AND session_id = s.session_id) as waitlist_count
      FROM sessions s
      LEFT JOIN speakers sp ON s.speaker_id = sp.speaker_id
      WHERE s.event_id = ?
      ORDER BY s.start_time ASC
    `;
    return await db.getAll(sql, [eventId, eventId]);
  }

  /**
   * Auto-calculate close times based on start_time
   * registration_close_time: 1 hour before start_time
   * waitlist_close_time: 30 minutes before start_time
   */
  static calculateCloseTimes(startTime) {
    const start = new Date(startTime);
    
    // Registration closes 1 hour before
    const registrationClose = new Date(start.getTime() - 60 * 60 * 1000);
    
    // Waitlist closes 30 minutes before
    const waitlistClose = new Date(start.getTime() - 30 * 60 * 1000);

    return {
      registration_close_time: registrationClose.toISOString(),
      waitlist_close_time: waitlistClose.toISOString()
    };
  }

  /**
   * Check if registration is still open
   */
  static async isRegistrationOpen(sessionId) {
    const session = await this.findById(sessionId);
    if (!session) return false;

    const now = new Date();
    const regCloseTime = new Date(session.registration_close_time);
    return now < regCloseTime;
  }

  /**
   * Check if waitlist is still open
   */
  static async isWaitlistOpen(sessionId) {
    const session = await this.findById(sessionId);
    if (!session) return false;

    const now = new Date();
    const waitlistCloseTime = new Date(session.waitlist_close_time);
    return now < waitlistCloseTime;
  }

  /**
   * Get available seats
   */
  static async getAvailableSeats(sessionId) {
    const [result] = await db.query(
      `SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE session_id = ? AND status = 'confirmed') as booked
       FROM sessions WHERE session_id = ?`,
      [sessionId, sessionId]
    );

    if (!result || result.length === 0) return 0;

    const row = result[0];
    return Math.max(0, row.capacity - row.booked);
  }

  /**
   * Get capacity info
   */
  static async getCapacityInfo(sessionId) {
    const [result] = await db.query(
      `SELECT 
        s.capacity,
        s.session_id,
        s.title,
        (SELECT COUNT(*) FROM registrations WHERE session_id = ? AND status = 'confirmed') as booked,
        (SELECT COUNT(*) FROM waitlist WHERE session_id = ?) as waitlisted
       FROM sessions s 
       WHERE s.session_id = ?`,
      [sessionId, sessionId, sessionId]
    );

    if (!result || result.length === 0) return null;

    const row = result[0];
    return {
      session_id: row.session_id,
      title: row.title,
      capacity: row.capacity,
      booked: row.booked,
      waitlisted: row.waitlisted,
      available: Math.max(0, row.capacity - row.booked),
      is_full: row.booked >= row.capacity
    };
  }
}

module.exports = Masterclass;
