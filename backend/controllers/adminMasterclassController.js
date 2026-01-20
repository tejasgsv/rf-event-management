const db = require("../config/database");
const Masterclass = require("../models/Masterclass");

/* =====================================================
   CREATE MASTERCLASS / SESSION (ADMIN)
===================================================== */
exports.createMasterclass = async (req, res) => {
  try {
    const {
      eventId,
      title,
      description,
      startTime,
      endTime,
      location,
      capacity,
      registrationCloseTime,
      waitlistCloseTime,
      status
    } = req.body;

    if (!eventId || !title || !startTime || !endTime || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Required: eventId, title, startTime, endTime, capacity"
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ success: false, message: "endTime must be after startTime" });
    }

    const [eventRows] = await db.query("SELECT id FROM events WHERE id = ?", [eventId]);
    if (!eventRows.length) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const calcRegClose = registrationCloseTime || new Date(start.getTime() - 60 * 60000);
    const calcWaitlistClose = waitlistCloseTime || new Date(start.getTime() - 30 * 60000);

    const allowedStatuses = ["DRAFT", "LIVE", "CANCELLED"];
    const safeStatus = allowedStatuses.includes(status) ? status : "DRAFT";

    const [result] = await db.query(
      `INSERT INTO masterclasses (eventId, title, description, startTime, endTime, location, capacity, bookedCount, registrationCloseTime, waitlistCloseTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [eventId, title, description || null, startTime, endTime, location || null, capacity, calcRegClose, calcWaitlistClose, safeStatus]
    );

    const [rows] = await db.query("SELECT * FROM masterclasses WHERE id = ?", [result.insertId]);

    res.status(201).json({ success: true, data: rows[0], message: "Masterclass created successfully" });
  } catch (err) {
    console.error("❌ Create masterclass error:", err);
    res.status(500).json({ success: false, message: "Failed to create masterclass", error: err.message });
  }
};

/* =====================================================
   GET SESSIONS BY EVENT (ADMIN)
===================================================== */
exports.getByEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId || req.query.eventId;

    if (!eventId) {
      return res.status(400).json({ success: false, message: "eventId is required" });
    }

    const [eventRows] = await db.query("SELECT id, name FROM events WHERE id = ?", [eventId]);
    if (!eventRows.length) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const [rows] = await db.query(
      `SELECT 
        m.*,
        (SELECT COUNT(*) FROM registrations WHERE masterclassId = m.id AND status = 'CONFIRMED') as registered_count,
        (SELECT COUNT(*) FROM waitlists WHERE masterclassId = m.id) as waitlist_count,
        (m.capacity - (SELECT COUNT(*) FROM registrations WHERE masterclassId = m.id AND status = 'CONFIRMED')) as available_seats
       FROM masterclasses m
       WHERE m.eventId = ?
       ORDER BY m.startTime ASC`,
      [eventId]
    );

    res.json({ success: true, data: rows, event: eventRows[0], count: rows.length });
  } catch (err) {
    console.error("❌ Get sessions error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch sessions", error: err.message });
  }
};

/* =====================================================
   GET SINGLE SESSION (ADMIN)
===================================================== */
exports.getMasterclass = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        m.*,
        (SELECT COUNT(*) FROM registrations WHERE masterclassId = m.id AND status = 'CONFIRMED') as registered_count,
        (SELECT COUNT(*) FROM waitlists WHERE masterclassId = m.id) as waitlist_count,
        (m.capacity - (SELECT COUNT(*) FROM registrations WHERE masterclassId = m.id AND status = 'CONFIRMED')) as available_seats
       FROM masterclasses m
       WHERE m.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ Get session error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch session", error: err.message });
  }
};

/* =====================================================
   UPDATE SESSION (ADMIN)
===================================================== */
exports.updateMasterclass = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      capacity,
      status,
      registrationCloseTime,
      waitlistCloseTime
    } = req.body;

    const [sessionRows] = await db.query("SELECT id FROM masterclasses WHERE id = ?", [id]);
    if (!sessionRows.length) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        return res.status(400).json({ success: false, message: "endTime must be after startTime" });
      }
    }

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (description !== undefined) { updates.push("description = ?"); values.push(description); }
    if (startTime !== undefined) { updates.push("startTime = ?"); values.push(startTime); }
    if (endTime !== undefined) { updates.push("endTime = ?"); values.push(endTime); }
    if (location !== undefined) { updates.push("location = ?"); values.push(location); }
    if (capacity !== undefined) { updates.push("capacity = ?"); values.push(capacity); }
    if (status !== undefined) { updates.push("status = ?"); values.push(status); }
    if (registrationCloseTime !== undefined) { updates.push("registrationCloseTime = ?"); values.push(registrationCloseTime); }
    if (waitlistCloseTime !== undefined) { updates.push("waitlistCloseTime = ?"); values.push(waitlistCloseTime); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);

    await db.query(`UPDATE masterclasses SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedRows] = await db.query("SELECT * FROM masterclasses WHERE id = ?", [id]);

    res.json({ success: true, data: updatedRows[0], message: "Session updated successfully" });
  } catch (err) {
    console.error("❌ Update session error:", err);
    res.status(500).json({ success: false, message: "Failed to update session", error: err.message });
  }
};

/* =====================================================
   DELETE SESSION (ADMIN)
===================================================== */
exports.deleteMasterclass = async (req, res) => {
  try {
    const { id } = req.params;

    const [sessionRows] = await db.query("SELECT id FROM masterclasses WHERE id = ?", [id]);
    if (!sessionRows.length) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const [[regCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM registrations WHERE masterclassId = ?",
      [id]
    );

    if (regCount.total > 0) {
      return res.status(409).json({ success: false, message: `Cannot delete session with ${regCount.total} active registrations` });
    }

    await db.query("DELETE FROM waitlists WHERE masterclassId = ?", [id]);
    await db.query("DELETE FROM masterclasses WHERE id = ?", [id]);

    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("❌ Delete session error:", err);
    res.status(500).json({ success: false, message: "Failed to delete session", error: err.message });
  }
};
