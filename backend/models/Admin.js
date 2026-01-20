/**
 * Admin Model
 * Replaces Mongoose with MySQL queries
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
  /**
   * Get all admins
   */
  static async find(options = {}) {
    const sql = `SELECT id, email, createdAt, updatedAt FROM \`admins\` LIMIT ? OFFSET ?`;
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    return await db.getAll(sql, [limit, skip]);
  }

  /**
   * Get admin by ID
   */
  static async findById(id) {
    const sql = `SELECT id, email, createdAt, updatedAt FROM \`admins\` WHERE id = ?`;
    return await db.getOne(sql, [id]);
  }

  /**
   * Get admin by email
   */
  static async findByEmail(email) {
    const sql = `SELECT * FROM \`admins\` WHERE email = ? LIMIT 1`;
    return await db.getOne(sql, [email.toLowerCase()]);
  }

  /**
   * Create new admin
   */
  static async create(data) {
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const sql = `
      INSERT INTO \`admins\` (email, password)
      VALUES (?, ?)
    `;

    const id = await db.insert(sql, [
      data.email.toLowerCase(),
      hashedPassword,
    ]);

    return {
      id,
      email: data.email,
      createdAt: new Date(),
    };
  }

  /**
   * Update admin
   */
  static async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email.toLowerCase());
    }
    if (data.password !== undefined) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE \`admins\` SET ${updates.join(', ')} WHERE id = ?`;
    await db.update(sql, values);
    return this.findById(id);
  }

  /**
   * Delete admin
   */
  static async findByIdAndDelete(id) {
    const admin = await this.findById(id);
    if (admin) {
      await db.remove(`DELETE FROM \`admins\` WHERE id = ?`, [id]);
    }
    return admin;
  }

  /**
   * Compare password with stored hash
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if admin exists
   */
  static async exists(email) {
    return await db.exists('admins', 'email = ?', [email.toLowerCase()]);
  }
}

module.exports = Admin;
