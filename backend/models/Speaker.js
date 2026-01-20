/**
 * Speaker Model
 * MySQL implementation for speaker management
 */

const db = require('../config/database');

class Speaker {
  /**
   * Get all speakers
   */
  static async find(options = {}) {
    const sql = `
      SELECT * FROM \`speakers\` 
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    return await db.getAll(sql, [limit, skip]);
  }

  /**
   * Get speaker by ID
   */
  static async findById(id) {
    const sql = `SELECT * FROM \`speakers\` WHERE id = ?`;
    return await db.getOne(sql, [id]);
  }

  /**
   * Get speakers by masterclass ID (with pivot)
   */
  static async findByMasterclassId(masterclassId) {
    const sql = `
      SELECT 
        s.*,
        ms.orderIndex,
        ms.role
      FROM \`speakers\` s
      INNER JOIN \`masterclass_speakers\` ms ON ms.speakerId = s.id
      WHERE ms.masterclassId = ?
      ORDER BY ms.orderIndex ASC
    `;
    return await db.getAll(sql, [masterclassId]);
  }

  /**
   * Create new speaker
   */
  static async create(data) {
    const sql = `
      INSERT INTO \`speakers\` 
      (name, title, designation, organization, bio, photo, email, linkedin, twitter)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      data.name,
      data.title || null,
      data.designation || null,
      data.organization || null,
      data.bio || null,
      data.photo || null,
      data.email || null,
      data.linkedin || null,
      data.twitter || null,
    ]);

    return { id: result.insertId, ...data };
  }

  /**
   * Update speaker
   */
  static async findByIdAndUpdate(id, data) {
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.designation !== undefined) {
      updates.push('designation = ?');
      values.push(data.designation);
    }
    if (data.organization !== undefined) {
      updates.push('organization = ?');
      values.push(data.organization);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }
    if (data.photo !== undefined) {
      updates.push('photo = ?');
      values.push(data.photo);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.linkedin !== undefined) {
      updates.push('linkedin = ?');
      values.push(data.linkedin);
    }
    if (data.twitter !== undefined) {
      updates.push('twitter = ?');
      values.push(data.twitter);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE \`speakers\` SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    return this.findById(id);
  }

  /**
   * Delete speaker
   */
  static async findByIdAndDelete(id) {
    const speaker = await this.findById(id);
    if (speaker) {
      await db.query(`DELETE FROM \`speakers\` WHERE id = ?`, [id]);
    }
    return speaker;
  }

  /**
   * Link speaker to masterclass
   */
  static async linkToMasterclass(speakerId, masterclassId, orderIndex = 0, role = 'SPEAKER') {
    const sql = `
      INSERT INTO \`masterclass_speakers\` (masterclassId, speakerId, orderIndex, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE orderIndex = ?, role = ?
    `;
    
    const [result] = await db.query(sql, [
      masterclassId,
      speakerId,
      orderIndex,
      role,
      orderIndex,
      role
    ]);

    return result;
  }

  /**
   * Unlink speaker from masterclass
   */
  static async unlinkFromMasterclass(speakerId, masterclassId) {
    const sql = `
      DELETE FROM \`masterclass_speakers\`
      WHERE masterclassId = ? AND speakerId = ?
    `;
    
    const [result] = await db.query(sql, [masterclassId, speakerId]);
    return result;
  }

  /**
   * Get all masterclasses for a speaker
   */
  static async getMasterclassesBySpeaker(speakerId) {
    const sql = `
      SELECT 
        m.*,
        e.name as eventName,
        ms.role
      FROM \`masterclasses\` m
      INNER JOIN \`masterclass_speakers\` ms ON ms.masterclassId = m.id
      INNER JOIN \`events\` e ON e.id = m.eventId
      WHERE ms.speakerId = ?
      ORDER BY m.startTime DESC
    `;
    return await db.getAll(sql, [speakerId]);
  }
}

module.exports = Speaker;
