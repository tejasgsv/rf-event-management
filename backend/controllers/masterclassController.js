const db = require("../config/database");
const { isRegistrationClosedForVenue, getVenueLocalTime } = require("../utils/timezoneHelper");

/**
 * CREATE MASTERCLASS (Admin)
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
      speakerId
    } = req.body;

    if (!eventId || !title || !startTime || !endTime || !location || !capacity) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const [events] = await db.query(
      "SELECT status FROM events WHERE id = ?",
      [eventId]
    );

    if (!events.length || events[0].status !== "ACTIVE") {
      return res.status(400).json({
        message: "Sessions can only be created for ACTIVE events"
      });
    }

    const [result] = await db.query(
      `INSERT INTO masterclasses
      (eventId, title, description, startTime, endTime, location, capacity,
       registrationCloseTime, waitlistCloseTime, speakerId, status, bookedCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', 0)`,
      [
        eventId,
        title,
        description || null,
        startTime,
        endTime,
        location,
        capacity,
        registrationCloseTime || null,
        waitlistCloseTime || null,
        speakerId || null
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create session" });
  }
};

/**
 * GET MASTERCLASSES BY EVENT (ADMIN)
 */
exports.getByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.query(
      `SELECT m.*, 
              s.name AS speakerName
       FROM masterclasses m
       LEFT JOIN speakers s ON m.speakerId = s.id
       WHERE m.eventId = ?
       ORDER BY m.startTime ASC`,
      [eventId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sessions" });
  }
};

/**
 * ✅ PUBLIC AGENDA (LIVE sessions only)
 */
exports.getPublicByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        m.id,
        m.eventId,
        m.title,
        m.description,
        m.startTime,
        m.endTime,
        m.location,
        m.capacity,
        m.bookedCount,
        m.registrationCloseTime,
        m.status,
        s.name AS speakerName,
        s.id as speakerId
      FROM masterclasses m
      LEFT JOIN speakers s ON m.speakerId = s.id
      WHERE m.eventId = ?
      AND m.status IN ('LIVE', 'DRAFT')
      ORDER BY m.startTime ASC`,
      [eventId]
    );

    // Enhance each masterclass with dynamic counts
    const enhancedRows = await Promise.all(rows.map(async (row) => {
      // Get confirmed registrations count
      const [regCount] = await db.query(
        `SELECT COUNT(*) as count FROM registrations 
         WHERE masterclassId = ? AND status = 'CONFIRMED'`,
        [row.id]
      );

      // Get waitlist count
      const [waitCount] = await db.query(
        `SELECT COUNT(*) as count FROM waitlists 
         WHERE masterclassId = ?`,
        [row.id]
      );

      return {
        ...row,
        registered_count: regCount[0].count,
        waitlist_count: waitCount[0].count,
        available_seats: Math.max(0, row.capacity - regCount[0].count)
      };
    }));

    res.json({ success: true, data: enhancedRows });
  } catch (err) {
    console.error("❌ Public agenda error:", err);
    res.status(500).json({ message: "Failed to load agenda" });
  }
};

/**
 * ✅ PUBLIC MASTERCLASS DETAIL
 */
exports.getPublicById = async (req, res) => {
  try {
    const id = req.params.id || req.params.sessionId;

    const [[row]] = await db.query(
      `SELECT 
        m.id,
        m.eventId,
        m.title,
        m.description,
        m.startTime,
        m.endTime,
        m.location,
        m.capacity,
        m.bookedCount,
        m.registrationCloseTime,
        m.status,
        s.name AS speakerName,
        s.id AS speakerId
       FROM masterclasses m
       LEFT JOIN speakers s ON m.speakerId = s.id
       WHERE m.id = ?`,
      [id]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("❌ Public session detail error:", err);
    res.status(500).json({ success: false, message: "Failed to load session" });
  }
};

/**
 * UPDATE MASTERCLASS (Admin)
 */
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
      speakerId
    } = req.body;

    await db.query(
      `UPDATE masterclasses SET
        title = ?, description = ?, startTime = ?, endTime = ?,
        location = ?, capacity = ?, status = ?, speakerId = ?
       WHERE id = ?`,
      [
        title,
        description,
        startTime,
        endTime,
        location,
        capacity,
        status,
        speakerId || null,
        id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/**
 * DELETE MASTERCLASS
 */
exports.deleteMasterclass = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM masterclasses WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/**
 * ✅ LIGHTWEIGHT STATUS ENDPOINT
 * Returns only dynamic data: bookedCount, capacity, user's registration status
 * Used for real-time polling on frontend (every 30 seconds)
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // Optional: email to check user's status

    // Get session info INCLUDING event timezone
    const [[session]] = await db.query(
      `SELECT 
        m.id,
        m.capacity,
        m.bookedCount,
        m.status,
        m.registrationCloseTime,
        m.startTime
       FROM masterclasses m
       WHERE m.id = ?`,
      [id]
    );

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: "Session not found" 
      });
    }

    // Check registration gate using VENUE TIMEZONE
    const venueTimezone = 'Asia/Kolkata';
    const gateCheck = isRegistrationClosedForVenue(session.startTime, venueTimezone);

    let registrationStatus = null;
    let waitlistPosition = null;

    // If email provided, check user's registration status
    if (email) {
      // Check confirmed registration
      const [[confirmed]] = await db.query(
        `SELECT id FROM registrations
         WHERE masterclassId = ? AND email = ? AND status = 'CONFIRMED'
         LIMIT 1`,
        [id, email]
      );

      if (confirmed) {
        registrationStatus = 'CONFIRMED';
      } else {
        // Check waitlist
        const [[waitlisted]] = await db.query(
          `SELECT position FROM waitlists
           WHERE masterclassId = ? AND email = ?
           LIMIT 1`,
          [id, email]
        );

        if (waitlisted) {
          registrationStatus = 'WAITLISTED';
          waitlistPosition = waitlisted.position;
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        capacity: session.capacity,
        bookedCount: session.bookedCount,
        status: session.status,
        registrationCloseTime: session.registrationCloseTime,
        startTime: session.startTime,
        registrationStatus,
        waitlistPosition,
        availableSeats: Math.max(0, session.capacity - session.bookedCount),
        // ✅ NEW: Timezone-safe gate info
        gateCheck: {
          isClosed: gateCheck.isClosed,
          reason: gateCheck.reason,
          timeRemaining: gateCheck.timeRemaining,
          venueTimezone,
          cutoffTimeLocal: gateCheck.cutoffTimeLocal
        }
      }
    });
  } catch (err) {
    console.error('❌ Session status error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch session status" 
    });
  }
};
/**
 * GET MASTERCLASS BY ID (PUBLIC - with speakers)
 * Used by RegistrationForm to fetch masterclass details before registration
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get masterclass details
    const [[masterclass]] = await db.query(
      `SELECT * FROM masterclasses WHERE id = ?`,
      [id]
    );

    if (!masterclass) {
      return res.status(404).json({
        success: false,
        error: 'Masterclass not found'
      });
    }

    // Get speakers for this masterclass
    const [speakers] = await db.query(
      `SELECT s.id, s.name, s.title, s.designation, s.organization,
              s.bio, s.photo, s.email, s.linkedin, s.twitter,
              ms.role
       FROM speakers s
       JOIN masterclass_speakers ms ON s.id = ms.speakerId
       WHERE ms.masterclassId = ?
       ORDER BY ms.orderIndex ASC`,
      [id]
    );

    // Get registration counts
    const [[counts]] = await db.query(
      `SELECT 
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'WAITLISTED' THEN 1 END) as waitlisted
       FROM registrations WHERE masterclassId = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...masterclass,
        speakers,
        confirmedCount: counts?.confirmed || 0,
        waitlistedCount: counts?.waitlisted || 0,
        availableSeats: masterclass.capacity - masterclass.bookedCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching masterclass:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch masterclass details',
      message: error.message
    });
  }
};