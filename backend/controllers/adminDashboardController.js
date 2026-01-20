const db = require("../config/database");

exports.getDashboard = async (req, res) => {
  try {
    /* ===============================
       1️⃣ LATEST EVENT
       =============================== */
    const [events] = await db.query(
      `
      SELECT 
        id,
        name,
        startDate,
        endDate,
        venue,
        status
      FROM events
      ORDER BY id DESC
      LIMIT 1
      `
    );

    if (!events || events.length === 0) {
      return res.json({
        success: true,
        eventExists: false,
      });
    }

    const event = events[0];

    /* ===============================
       2️⃣ TOTAL MASTERCLASSES (SESSIONS)
       =============================== */
    const [sessionStats] = await db.query(
      "SELECT COUNT(*) AS total FROM masterclasses WHERE eventId = ?",
      [event.id]
    );

    /* ===============================
       3️⃣ REGISTRATIONS (CONFIRMED)
       =============================== */
    const [registrationStats] = await db.query(
      "SELECT COUNT(*) AS total FROM registrations WHERE eventId = ? AND status = 'CONFIRMED'",
      [event.id]
    );

    /* ===============================
       4️⃣ WAITLIST
       =============================== */
    const [waitlistStats] = await db.query(
      "SELECT COUNT(*) AS total FROM registrations WHERE eventId = ? AND status = 'WAITLISTED'",
      [event.id]
    );

    /* ===============================
       5️⃣ SEAT UTILIZATION (ALL MASTERCLASSES)
       =============================== */
    const [capacityStats] = await db.query(
      `SELECT 
        SUM(capacity) as totalCapacity, 
        SUM(bookedCount) as totalBooked 
       FROM masterclasses 
       WHERE eventId = ?`,
      [event.id]
    );

    const totalCapacity = capacityStats[0]?.totalCapacity || 0;
    const totalBooked = capacityStats[0]?.totalBooked || 0;

    const utilization =
      totalCapacity > 0
        ? Math.round((totalBooked / totalCapacity) * 100)
        : 0;

    /* ===============================
       FINAL RESPONSE
       =============================== */
    res.json({
      success: true,
      eventExists: true,
      event,
      stats: {
        sessions: sessionStats[0]?.total || 0,
        registrations: registrationStats[0]?.total || 0,
        waitlist: waitlistStats[0]?.total || 0,
        totalCapacity,
        totalBooked,
        utilization,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: err.message
    });
  }
};
