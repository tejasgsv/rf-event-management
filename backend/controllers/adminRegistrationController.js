const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { catchAsync } = require('../utils/errorHandler');
const { promoteFromWaitlist } = require('../utils/waitlistPromotion');
const { generateCompleteQR } = require('../utils/qrGenerator');

/* ================= HELPERS ================= */
const registrationClosed = (closeTime) => {
  if (!closeTime) return false;
  const now = new Date();
  return now >= new Date(closeTime);
};

async function countConfirmed(conn, masterclassId) {
  const [[row]] = await conn.query(
    `SELECT COUNT(*) AS confirmed FROM registrations
     WHERE masterclassId = ? AND status = 'CONFIRMED'`,
    [masterclassId]
  );
  return row.confirmed || 0;
}

function splitName(fullName) {
  if (!fullName) return { name: 'Guest', surname: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: '' };
  return { name: parts.slice(0, -1).join(' '), surname: parts.slice(-1).join(' ') };
}

/* =====================================================
   CANCEL REGISTRATION (ADMIN) — Ghost seat + promotion
   PRODUCTION-READY: Uses sequential locking to prevent
   race conditions during concurrent cancellations
===================================================== */
exports.cancelRegistration = catchAsync(async (req, res) => {
  const { registrationId } = req.params;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Lock the registration row
    const [[reg]] = await conn.query(
      'SELECT * FROM registrations WHERE registrationId = ? FOR UPDATE',
      [registrationId]
    );

    if (!reg) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (reg.status !== 'CONFIRMED') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Only CONFIRMED registrations can be cancelled' });
    }

    // Lock the masterclass row
    const [[masterclass]] = await conn.query(
      'SELECT * FROM masterclasses WHERE id = ? FOR UPDATE',
      [reg.masterclassId]
    );

    if (!masterclass) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Masterclass not found' });
    }

    if (registrationClosed(masterclass.registrationCloseTime)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cancellation closed for this session' });
    }

    // Cancel the registration
    await conn.query(
      "UPDATE registrations SET status = 'CANCELLED' WHERE registrationId = ?",
      [registrationId]
    );

    // Decrement booked count
    await conn.query(
      'UPDATE masterclasses SET bookedCount = bookedCount - 1 WHERE id = ?',
      [reg.masterclassId]
    );

    await conn.commit();

    console.log(`✅ Cancelled registration ${registrationId} for masterclass ${reg.masterclassId}`);

    // Trigger waitlist promotion (outside transaction to avoid blocking)
    // This uses full sequential locking and idempotency checks
    const promotionResult = await promoteFromWaitlist(reg.masterclassId);

    res.json({ 
      success: true, 
      message: 'Registration cancelled',
      promoted: promotionResult.success ? { email: promotionResult.promotedUser } : null 
    });

  } catch (err) {
    await conn.rollback();
    console.error('❌ Cancel registration failed:', err.message);
    res.status(500).json({ success: false, message: 'Cancellation failed' });
  } finally {
    conn.release();
  }
});

/* =====================================================
   ADMIN FORCE PROMOTE (VIP / override capacity)
===================================================== */
exports.forcePromoteWaitlist = catchAsync(async (req, res) => {
  const { waitlistId } = req.params;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const [[wl]] = await conn.query(
      'SELECT * FROM waitlists WHERE id = ? FOR UPDATE',
      [waitlistId]
    );

    if (!wl) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Waitlist entry not found' });
    }

    const [[masterclass]] = await conn.query(
      'SELECT * FROM masterclasses WHERE id = ? FOR UPDATE',
      [wl.masterclassId]
    );

    if (!masterclass) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Masterclass not found' });
    }

    const { name, surname } = splitName(wl.name);
    const registrationId = `REG-${uuidv4().slice(0, 8).toUpperCase()}`;
    const { qrCode } = await generateCompleteQR(registrationId, wl.masterclassId);

    await conn.query(
      `INSERT INTO registrations (
        eventId, masterclassId, registrationId, name, surname, email, mobile, status, qrCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)`,
      [
        masterclass.eventId,
        wl.masterclassId,
        registrationId,
        name,
        surname,
        wl.email,
        'N/A',
        qrCode
      ]
    );

    await conn.query('DELETE FROM waitlists WHERE id = ?', [waitlistId]);
    await conn.query(
      'UPDATE waitlists SET position = position - 1 WHERE masterclassId = ? AND position > ?',
      [wl.masterclassId, wl.position]
    );

    await conn.commit();

    res.json({ success: true, message: 'Force promotion successful', registrationId });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Force promote failed:', err.message);
    res.status(500).json({ success: false, message: 'Force promotion failed' });
  } finally {
    conn.release();
  }
});

/* =====================================================
   SEAT STATUS (ADMIN)
===================================================== */
exports.getMasterclassSeatStatus = catchAsync(async (req, res) => {
  const { masterclassId } = req.params;

  const [[masterclass]] = await db.query(
    'SELECT id, capacity, registrationCloseTime FROM masterclasses WHERE id = ?',
    [masterclassId]
  );

  if (!masterclass) {
    return res.status(404).json({ success: false, message: 'Masterclass not found' });
  }

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS confirmed FROM registrations WHERE masterclassId = ? AND status = 'CONFIRMED'`,
    [masterclassId]
  );

  const confirmed = countRow.confirmed || 0;
  const available = Math.max(0, masterclass.capacity - confirmed);

  res.json({
    success: true,
    capacity: masterclass.capacity,
    confirmed,
    available,
    registrationClosed: registrationClosed(masterclass.registrationCloseTime)
  });
});

/* =====================================================
   WAITLIST (ADMIN)
===================================================== */
exports.getAllWaitlist = catchAsync(async (_req, res) => {
  const { masterclassId } = _req.query;
  const params = [];
  let whereClause = '';

  if (masterclassId) {
    whereClause = 'WHERE w.masterclassId = ?';
    params.push(masterclassId);
  }

  const [rows] = await db.query(
    `SELECT 
      w.id,
      w.masterclassId,
      w.name,
      w.email,
      w.position,
      w.createdAt,
      m.title AS sessionTitle,
      e.name AS eventName
     FROM waitlists w
     LEFT JOIN masterclasses m ON w.masterclassId = m.id
     LEFT JOIN events e ON m.eventId = e.id
     ${whereClause}
     ORDER BY w.masterclassId, w.position ASC`,
    params
  );

  res.json({ success: true, data: rows });
});

/* =====================================================
   ADMIN WAITLIST DELETE
===================================================== */
exports.deleteWaitlistEntry = catchAsync(async (req, res) => {
  const { waitlistId } = req.params;

  const [result] = await db.query(
    'DELETE FROM waitlists WHERE id = ?',
    [waitlistId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Waitlist entry not found' });
  }

  res.json({ success: true, message: 'Waitlist entry removed' });
});

/* =====================================================
   ADMIN REGISTRATIONS BY EVENT
===================================================== */
exports.getRegistrationsByEvent = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  const [rows] = await db.query(
    `SELECT 
      r.registrationId,
      r.name,
      r.surname,
      r.email,
      r.mobile,
      r.company,
      r.jobTitle,
      r.country,
      r.postalCode,
      r.accessibilityNeeds,
      r.status,
      r.createdAt,
      m.title AS sessionTitle,
      e.name AS eventName
     FROM registrations r
     LEFT JOIN masterclasses m ON r.masterclassId = m.id
     LEFT JOIN events e ON r.eventId = e.id
     WHERE r.eventId = ?
     ORDER BY r.createdAt DESC`,
    [eventId]
  );

  res.json({ success: true, data: rows });
});
