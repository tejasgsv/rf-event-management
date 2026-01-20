const db = require("../config/database");

/**
 * ============================================
 * GET /api/events
 * Public – fetch all PUBLISHED events
 * Used by EventHome.jsx
 * ============================================
 */
exports.getAllActiveEvents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        e.id,
        e.name,
        e.description,
        e.venue,
        e.startDate AS start_date,
        e.endDate AS end_date,
        e.status,
        (
          SELECT COUNT(*) 
          FROM registrations r
          JOIN masterclasses m ON m.id = r.masterclassId
          WHERE m.eventId = e.id
            AND r.status = 'CONFIRMED'
        ) AS bookedCount
       FROM events e
       WHERE e.status = 'PUBLISHED'
       ORDER BY e.startDate ASC`
    );

    return res.json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    console.error("❌ Fetch events error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};

/**
 * ============================================
 * GET /api/events/:id
 * Public – fetch single PUBLISHED event
 * ============================================
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        e.id,
        e.name,
        e.description,
        e.venue,
        e.startDate AS start_date,
        e.endDate AS end_date,
        e.status,
        (
          SELECT COUNT(*) 
          FROM registrations r
          JOIN masterclasses m ON m.id = r.masterclassId
          WHERE m.eventId = e.id
            AND r.status = 'CONFIRMED'
        ) AS bookedCount
       FROM events e
       WHERE e.id = ? AND e.status = 'PUBLISHED'`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Fetch event by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};

/**
 * Alias (for backward compatibility)
 */
exports.getEvents = exports.getAllActiveEvents;
