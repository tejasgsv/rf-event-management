const db = require("../config/database");

/**
 * ADMIN QR SCAN
 * POST /api/admin/scan
 */
exports.scanQR = async (req, res) => {
  const { registrationId } = req.body;

  if (!registrationId) {
    return res.status(400).json({
      allowed: false,
      reason: "INVALID_QR"
    });
  }

  try {
    const [[row]] = await db.query(
      `SELECT 
        r.status,
        r.email,
        m.title AS sessionTitle,
        m.status AS sessionStatus,
        e.eventtitle
       FROM registrations r
       JOIN masterclasses m ON r.masterclassId = m.id
       JOIN events e ON r.eventId = e.id
       WHERE r.registrationId = ?`,
      [registrationId.trim()]
    );

    // ❌ Registration not found
    if (!row) {
      return res.json({
        allowed: false,
        reason: "INVALID_QR"
      });
    }

    // ❌ Not confirmed
    if (row.status !== "CONFIRMED") {
      return res.json({
        allowed: false,
        reason: "NOT_CONFIRMED"
      });
    }

    // ❌ Session not live
    if (row.sessionStatus !== "LIVE") {
      return res.json({
        allowed: false,
        reason: "SESSION_INACTIVE"
      });
    }

    // ✅ ENTRY ALLOWED
    return res.json({
      allowed: true,
      data: {
        email: row.email,
        sessionTitle: row.sessionTitle,
        eventtitle: row.eventtitle
      }
    });

  } catch (err) {
    console.error("Scanner error:", err);
    return res.status(500).json({
      allowed: false,
      reason: "SERVER_ERROR"
    });
  }
};
