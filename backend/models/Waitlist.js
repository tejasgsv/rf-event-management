/**
 * Waitlist Model
 * Replaces Mongoose with MySQL queries
 */

const db = require('../config/database');

class Waitlist {
  /**
   * Get all waitlist entries
   */
  static async find(filter = {}, options = {}) {
    let sql = `SELECT * FROM \`waitlists\` WHERE 1=1`;
    const params = [];

    if (filter.masterclassId) {
      sql += ` AND masterclassId = ?`;
      params.push(filter.masterclassId);
    }
    if (filter.email) {
      sql += ` AND email = ?`;
      params.push(filter.email);
    }

    sql += ` ORDER BY position ASC`;

    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    return await db.getAll(sql, params);
  }

  /**
   * Get waitlist entry by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM \`waitlists\` WHERE id = ?`;
    return await db.getOne(sql, [id]);
  }

  /**
   * Create new waitlist entry
   */
  static async create(data) {
    const sql = `
      INSERT INTO \`waitlists\` (masterclassId, name, email, position)
      VALUES (?, ?, ?, ?)
    `;
    const id = await db.insert(sql, [
      data.masterclassId,
      data.name,
      data.email,
      data.position,
    ]);
    return { id, ...data };
  }

  /**
   * Update waitlist entry
   */
  static async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.position !== undefined) {
      updates.push('position = ?');
      values.push(data.position);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE \`waitlists\` SET ${updates.join(', ')} WHERE id = ?`;
    await db.update(sql, values);
    return this.findById(id);
  }

  /**
   * Delete waitlist entry
   */
  static async findByIdAndDelete(id) {
    const entry = await this.findById(id);
    if (entry) {
      await db.remove(`DELETE FROM \`waitlists\` WHERE id = ?`, [id]);
    }
    return entry;
  }

  /**
   * Delete all waitlist entries for a masterclass
   */
  static async deleteMany(filter) {
    let sql = `DELETE FROM \`waitlists\` WHERE 1=1`;
    const params = [];

    if (filter.masterclassId) {
      sql += ` AND masterclassId = ?`;
      params.push(filter.masterclassId);
    }

    return await db.remove(sql, params);
  }

  /**
   * Count waitlist entries
   */
  static async countDocuments(filter = {}) {
    let where = '';
    const params = [];

    if (filter.masterclassId) {
      where = 'masterclassId = ?';
      params.push(filter.masterclassId);
    }

    return await db.count('waitlists', where, params);
  }

  /**
   * Find one entry
   */
  static async findOne(filter) {
    const results = await this.find(filter, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get highest position for a masterclass
   */
  static async getMaxPosition(masterclassId) {
    const sql = `SELECT MAX(position) as maxPos FROM \`waitlists\` WHERE masterclassId = ?`;
    const result = await db.getOne(sql, [masterclassId]);
    return result?.maxPos || 0;
  }
}

module.exports = Waitlist;
