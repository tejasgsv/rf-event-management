const db = require("../config/database");

/* =====================================================
   CREATE SESSION (ADMIN)
   Table: sessions
===================================================== */
exports.createSession = async (req, res) => {
  try {
    const {
      event_id,
      speaker_id,
      title,
      session_type,
      start_time,
      end_time,
      hall,
      description
    } = req.body;

    // Basic validation
    if (!event_id || !title || !session_type || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    // Validate event exists
    const [eventRows] = await db.query(
      "SELECT id FROM events WHERE id = ?",
      [event_id]
    );

    if (eventRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event"
      });
    }

    const [result] = await db.query(
      `INSERT INTO sessions
        (event_id, speaker_id, title, session_type, start_time, end_time, hall, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event_id,
        speaker_id || null,
        title,
        session_type,
        start_time,
        end_time,
        hall || null,
        description || null
      ]
    );

    const [rows] = await db.query(
      "SELECT * FROM sessions WHERE session_id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    console.error("❌ Create session error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create session"
    });
  }
};

/* =====================================================
   GET SESSIONS BY EVENT (ADMIN + PUBLIC)
===================================================== */
exports.getByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        s.session_id,
        s.event_id,
        s.title,
        s.session_type,
        s.start_time,
        s.end_time,
        s.hall,
        s.description,
        sp.full_name AS speakerName
      FROM sessions s
      LEFT JOIN speakers sp ON s.speaker_id = sp.speaker_id
      WHERE s.event_id = ?
      ORDER BY s.start_time ASC`,
      [eventId]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("❌ Fetch sessions error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load sessions"
    });
  }
};

/* =====================================================
   UPDATE SESSION (ADMIN)
===================================================== */
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      speaker_id,
      title,
      session_type,
      start_time,
      end_time,
      hall,
      description
    } = req.body;

    await db.query(
      `UPDATE sessions SET
        speaker_id = ?,
        title = ?,
        session_type = ?,
        start_time = ?,
        end_time = ?,
        hall = ?,
        description = ?
       WHERE session_id = ?`,
      [
        speaker_id || null,
        title,
        session_type,
        start_time,
        end_time,
        hall || null,
        description || null,
        id
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {
    console.error("❌ Update session error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update session"
    });
  }
};

/* =====================================================
   DELETE SESSION (ADMIN)
   (No session-level registration exists yet)
===================================================== */
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM sessions WHERE session_id = ?",
      [id]
    );

    res.json({
      success: true
    });

  } catch (err) {
    console.error("❌ Delete session error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete session"
    });
  }
};
