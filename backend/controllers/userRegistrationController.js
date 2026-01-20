const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const db = require("../config/database");
const { generateCompleteQR } = require("../utils/qrGenerator");
const { isRegistrationClosedForVenue } = require("../utils/timezoneHelper");
const { getConfirmedCount, addWaitlistEntry } = require("../services/registrationService");

/* ================= EMAIL SETUP ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= VALIDATION ================= */

const validateRegistration = ({ name, surname, email, mobile, country, postalCode, company, jobTitle }) => {
  const errors = [];

  if (!name || name.trim().length < 2) errors.push("Invalid name");
  if (!surname || surname.trim().length < 2) errors.push("Invalid surname");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) errors.push("Invalid email");

  if (!mobile || mobile.trim().length < 7)
    errors.push("Invalid mobile number");

  if (!country || country.trim().length < 2)
    errors.push("Invalid country");

  if (!postalCode || postalCode.trim().length < 2)
    errors.push("Invalid postal code");

  if (!company || company.trim().length < 2)
    errors.push("Invalid organization");

  if (!jobTitle || jobTitle.trim().length < 2)
    errors.push("Invalid designation");

  return errors;
};

/* ================= HELPER: RECALCULATE BOOKED COUNT ================= */
async function recalculateBookedCount(masterclassId) {
  try {
    const [[result]] = await db.query(
      `SELECT COUNT(*) as total FROM registrations 
       WHERE masterclassId = ? AND status = 'CONFIRMED'`,
      [masterclassId]
    );
    
    await db.query(
      `UPDATE masterclasses SET bookedCount = ? WHERE id = ?`,
      [result.total || 0, masterclassId]
    );
    
    return result.total || 0;
  } catch (err) {
    console.error(`❌ Failed to recalculate booked_count for masterclass ${masterclassId}:`, err);
  }
}

/* ================= HELPER: SEND REGISTRATION EMAIL ================= */
async function sendRegistrationEmail(email, status, qrCode, session) {
  const subject = status === 'CONFIRMED' 
    ? `✅ Registration Confirmed - ${session.title}`
    : `📋 Added to Waitlist - ${session.title}`;
    
  const html = status === 'CONFIRMED'
    ? `
      <h2>Registration Confirmed!</h2>
      <p>You are registered for <strong>${session.title}</strong></p>
      <p><strong>Time:</strong> ${new Date(session.startTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</p>
      <p>Please present this QR code at the venue:</p>
      <img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
    `
    : `
      <h2>Added to Waitlist</h2>
      <p>You've been added to the waitlist for <strong>${session.title}</strong></p>
      <p>We'll notify you if a spot becomes available.</p>
    `;

  await transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

/* =================================================
   REGISTER / WAITLIST
================================================= */
exports.registerForEvent = async (req, res) => {
  const {
    masterclassId: masterclassIdInput,
    sessionId,
    name,
    surname,
    email,
    mobile,
    company,
    jobTitle,
    country,
    postalCode,
    accessibilityNeeds,
  } = req.body;

  const masterclassId = sessionId || masterclassIdInput;

  if (!masterclassId) {
    return res.status(400).json({
      success: false,
      message: "Session ID required",
    });
  }

  const errors = validateRegistration({
    name,
    surname,
    email,
    mobile,
    country,
    postalCode,
    company,
    jobTitle,
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const conn = await db.pool.getConnection();
  await conn.beginTransaction();

  try {
    const trimmedEmail = email.trim().toLowerCase();

    /* 🔒 Duplicate check */
    const [existing] = await conn.query(
      `SELECT id FROM registrations
       WHERE masterclassId = ?
         AND email = ?
         AND status IN ('CONFIRMED','WAITLISTED')`,
      [masterclassId, trimmedEmail]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Already registered for this session",
      });
    }

    const [existingWaitlist] = await conn.query(
      `SELECT id FROM waitlists WHERE masterclassId = ? AND email = ?`,
      [masterclassId, trimmedEmail]
    );

    if (existingWaitlist.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Already on waitlist for this session",
      });
    }

    /* 🔒 Lock masterclass (FOR UPDATE prevents race conditions) */
    const [[session]] = await conn.query(
      `SELECT m.* FROM masterclasses m
       JOIN events e ON m.eventId = e.id
       WHERE m.id = ? FOR UPDATE`,
      [masterclassId]
    );

    if (!session) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    /* ⏱️ Check registration closure using VENUE TIMEZONE */
    const venueTimezone = 'Asia/Kolkata';
    const gateCheck = isRegistrationClosedForVenue(session.startTime, venueTimezone);
    
    if (gateCheck.isClosed) {
      await conn.rollback();
      return res.status(403).json({
        success: false,
        message: gateCheck.reason,
        gateCheck
      });
    }

    /* 🔄 Check for overlapping sessions */
    const [[overlap]] = await conn.query(
      `SELECT COUNT(*) as count FROM registrations r
       INNER JOIN masterclasses m ON r.masterclassId = m.id
       WHERE r.email = ? 
         AND r.status = 'CONFIRMED'
         AND r.masterclassId != ?
         AND NOT (m.endTime <= ? OR m.startTime >= ?)`,
      [trimmedEmail, masterclassId, session.startTime, session.endTime]
    );

    if (overlap.count > 0) {
      await conn.rollback();
      
      // Get conflicting session details
      const [[conflict]] = await conn.query(
        `SELECT m.title, m.startTime, m.endTime FROM registrations r
         INNER JOIN masterclasses m ON r.masterclassId = m.id
         WHERE r.email = ? AND r.status = 'CONFIRMED'
         AND NOT (m.endTime <= ? OR m.startTime >= ?)
         LIMIT 1`,
        [trimmedEmail, session.startTime, session.endTime]
      );
      
      return res.status(409).json({
        success: false,
        message: `Time conflict with "${conflict.title}" (${new Date(conflict.startTime).toLocaleString()} - ${new Date(conflict.endTime).toLocaleString()})`,
        conflictingSession: conflict,
      });
    }

    /* 🪑 Seat logic - use actual confirmed count */
    const actualConfirmed = await getConfirmedCount(conn, masterclassId);
    const isFull = actualConfirmed >= session.capacity;
    const status = isFull ? "WAITLISTED" : "CONFIRMED";

    /* 🆔 Registration ID */
    const registrationId = `REG-${uuidv4()
      .slice(0, 8)
      .toUpperCase()}`;

    /* 🎟️ QR */
    const { qrCode } = isFull
      ? { qrCode: null }
      : await generateCompleteQR(registrationId, masterclassId);

    /* 🧾 Save registration */
    await conn.query(
      `INSERT INTO registrations (
        registrationId,
        eventId,
        masterclassId,
        name,
        surname,
        email,
        mobile,
        company,
        jobTitle,
        country,
        postalCode,
        accessibilityNeeds,
        status,
        qrCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registrationId,
        session.eventId,
        masterclassId,
        name.trim(),
        surname.trim(),
        trimmedEmail,
        mobile.trim(),
        company || null,
        jobTitle || null,
        country || null,
        postalCode || null,
        accessibilityNeeds || null,
        status,
        qrCode,
      ]
    );

    if (status === "WAITLISTED") {
      await addWaitlistEntry(
        conn,
        masterclassId,
        `${name} ${surname}`.trim(),
        trimmedEmail
      );
    }

    /* 🪑 Increment seat count (ONLY if CONFIRMED) */
    if (status === "CONFIRMED") {
      await conn.query(
        "UPDATE masterclasses SET bookedCount = bookedCount + 1 WHERE id = ?",
        [masterclassId]
      );
    }

    await conn.commit();

    /* 📧 Recalculate booked_count after commit (ensure accuracy) */
    await recalculateBookedCount(masterclassId);

    /* 📧 Email (async, non-blocking) */
    sendRegistrationEmail(trimmedEmail, status, qrCode, session).catch(err => {
      console.error("❌ Email send failed:", err.message);
    });

    return res.status(201).json({
      success: true,
      data: {
        registrationId,
        name,
        surname,
        email: trimmedEmail,
        mobile,
        company,
        jobTitle,
        country,
        postalCode,
        accessibilityNeeds,
        status,
        qrCode,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Registration error:", err.message);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    conn.release();
  }
};

/* =================================================
   MY REGISTRATIONS
================================================= */
exports.getUserRegistrations = async (req, res) => {
  const email = req.params.email.trim().toLowerCase();

  const [rows] = await db.query(
    `SELECT
      r.registrationId,
      r.status,
      r.qrCode,
      m.title AS session_title,
      e.name AS eventtitle
     FROM registrations r
     JOIN masterclasses m ON r.masterclassId = m.id
     JOIN events e ON r.eventId = e.id
     WHERE r.email = ?
     ORDER BY r.createdAt DESC`,
    [email]
  );

  res.json({
    success: true,
    data: rows,
  });
};

/* =================================================
   SINGLE REGISTRATION (QR SCREEN)
================================================= */
exports.getRegistration = async (req, res) => {
  const { registrationId } = req.params;

  const [rows] = await db.query(
    `SELECT * FROM registrations WHERE registrationId = ?`,
    [registrationId]
  );

  if (!rows.length) {
    return res.status(404).json({
      success: false,
      message: "Registration not found",
    });
  }

  res.json({
    success: true,
    data: rows[0],
  });
};
