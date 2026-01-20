/**
 * Event Model
 * Replaces Mongoose with MySQL queries
 */

const db = require('../config/database');

class Event {
  /**
   * Get all events
   */
  static async find(options = {}) {
    const sql = `
      SELECT * FROM \`events\` 
      ORDER BY start_date ASC
      LIMIT ? OFFSET ?
    `;
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    return await db.getAll(sql, [limit, skip]);
  }

  /**
   * Get event by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM \`events\` WHERE event_id = ?`;
    return await db.getOne(sql, [id]);
  }

  /**
   * Create new event
   */
  static async create(data) {
    const sql = `
      INSERT INTO \`events\` (event_name, start_date, end_date, venue_name, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const id = await db.insert(sql, [
      data.event_name || data.name,
      data.start_date || data.startDate,
      data.end_date || data.endDate,
      data.venue_name || data.venue,
      data.description || null,
      data.status || 'upcoming',
    ]);
    return { event_id: id, ...data };
  }

  /**
   * Update event
   */
  static async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.event_name !== undefined) {
      updates.push('event_name = ?');
      values.push(data.event_name);
    } else if (data.name !== undefined) {
      updates.push('event_name = ?');
      values.push(data.name);
    }

    if (data.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(data.start_date);
    } else if (data.startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(data.startDate);
    }

    if (data.end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(data.end_date);
    } else if (data.endDate !== undefined) {
      updates.push('end_date = ?');
      values.push(data.endDate);
    }

    if (data.venue_name !== undefined) {
      updates.push('venue_name = ?');
      values.push(data.venue_name);
    } else if (data.venue !== undefined) {
      updates.push('venue_name = ?');
      values.push(data.venue);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE \`events\` SET ${updates.join(', ')} WHERE event_id = ?`;
    await db.update(sql, values);
    return this.findById(id);
  }

  /**
   * Delete event
   */
  static async findByIdAndDelete(id) {
    const event = await this.findById(id);
    if (event) {
      await db.remove(`DELETE FROM \`events\` WHERE event_id = ?`, [id]);
    }
    return event;
  }
}

module.exports = Event;
