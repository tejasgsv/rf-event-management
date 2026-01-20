const db = require('../config/database');

/* ================= CREATE EVENT ================= */
exports.createEvent = async (req, res) => {
  try {
    const { name, startDate, endDate, venue, description } = req.body;

    if (!name || !startDate || !endDate || !venue) {
      return res.status(400).json({ success: false, message: 'Required: name, startDate, endDate, venue' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
    }

    const [result] = await db.query(
      `INSERT INTO events (name, startDate, endDate, venue, description, status)
       VALUES (?, ?, ?, ?, ?, 'DRAFT')`,
      [name, startDate, endDate, venue, description || null]
    );

    const [events] = await db.query(`SELECT * FROM events WHERE id = ?`, [result.insertId]);
    res.status(201).json({ success: true, data: events[0] });
  } catch (error) {
    console.error('❌ Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
  }
};

/* ================= GET ALL EVENTS ================= */
exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await db.query(`SELECT * FROM events ORDER BY startDate DESC`);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('❌ Get events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};

/* ================= GET SINGLE EVENT ================= */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [events] = await db.query(`SELECT * FROM events WHERE id = ?`, [id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: events[0] });
  } catch (error) {
    console.error('❌ Get event error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event', error: error.message });
  }
};

/* ================= UPDATE EVENT ================= */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [events] = await db.query(`SELECT id, status FROM events WHERE id = ?`, [id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { name, startDate, endDate, venue, description, status } = req.body;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (startDate !== undefined) { updates.push('startDate = ?'); values.push(startDate); }
    if (endDate !== undefined) { updates.push('endDate = ?'); values.push(endDate); }
    if (venue !== undefined) { updates.push('venue = ?'); values.push(venue); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await db.query(`SELECT * FROM events WHERE id = ?`, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('❌ Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

/* ================= DELETE EVENT ================= */
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query('SELECT id FROM events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await db.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true, message: 'Event deleted permanently' });
  } catch (error) {
    console.error('❌ Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};

/* ================= ARCHIVE EVENT ================= */
exports.archiveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("UPDATE events SET status = 'ARCHIVED' WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event archived successfully' });
  } catch (error) {
    console.error('❌ Archive event error:', error);
    res.status(500).json({ success: false, message: 'Failed to archive event', error: error.message });
  }
};
