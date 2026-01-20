const db = require("../config/database");
const { generateCompleteQR } = require("../utils/qrGenerator");
const nodemailer = require("nodemailer");

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= CANCEL REGISTRATION ================= */

exports.cancelRegistration = async (req, res) => {
  const { registrationId } = req.params;

  const conn = await db.pool.getConnection();
  await conn.beginTransaction();

  try {
    /* ================= LOCK REGISTRATION (FOR UPDATE prevents race conditions) ================= */
    const [[reg]] = await conn.query(
      `SELECT r.*, m.title as sessionTitle, m.waitlistCloseTime, m.startTime
       FROM registrations r
       INNER JOIN masterclasses m ON r.masterclassId = m.id
       WHERE r.registrationId = ? AND r.status = 'CONFIRMED'
       FOR UPDATE`,
      [registrationId]
    );

    if (!reg) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "Confirmed registration not found",
      });
    }

    /* ================= CANCEL ================= */
    await conn.query(
      `UPDATE registrations SET status = 'CANCELLED' WHERE id = ?`,
      [reg.id]
    );

    /* ================= FREE SEAT (SAFE) ================= */
    await conn.query(
      `UPDATE masterclasses SET bookedCount = GREATEST(bookedCount - 1, 0) WHERE id = ?`,
      [reg.masterclassId]
    );

    /* ================= AUTO PROMOTE WAITLIST (ATOMIC) ================= */
    const promotedUser = await promoteWaitlistAtomic(conn, reg.masterclassId, reg.waitlistCloseTime);

    await conn.commit();

    /* ================= SEND EMAILS AFTER COMMIT ================= */
    // Cancellation email
    sendCancellationEmail(reg.email, reg.sessionTitle).catch(err => {
      console.error("❌ Cancellation email failed:", err.message);
    });

    // Promotion email (if someone was promoted)
    if (promotedUser) {
      sendPromotionEmail(
        promotedUser.email,
        promotedUser.name,
        reg.sessionTitle,
        promotedUser.qrCode,
        reg.startTime
      ).catch(err => {
        console.error("❌ Promotion email failed:", err.message);
      });
    }

    res.json({
      success: true,
      message: "Registration cancelled successfully",
      promotedUser: promotedUser ? promotedUser.email : null,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Cancel error:", err);
    res.status(500).json({
      success: false,
      message: "Cancellation failed",
      error: err.message,
    });
  } finally {
    conn.release();
  }
};

/* ================= AUTO PROMOTE WAITLIST (ATOMIC) ================= */
async function promoteWaitlistAtomic(conn, masterclassId, waitlistCloseTime) {
  /* Check if waitlist promotion is still allowed */
  const now = new Date();
  const closeTime = new Date(waitlistCloseTime);
  
  if (now >= closeTime) {
    console.log(`ℹ️ Waitlist closed for masterclass ${masterclassId}, skipping promotion`);
    return null;
  }

  /* Find first waitlisted user (LOCK IT) */
  const [[waitUser]] = await conn.query(
    `SELECT * FROM registrations
     WHERE masterclassId = ? AND status = 'WAITLISTED'
     ORDER BY createdAt ASC
     LIMIT 1
     FOR UPDATE`,
    [masterclassId]
  );

  if (!waitUser) {
    return null; // No one on waitlist
  }

  /* Generate new QR code */
  const qr = await generateCompleteQR(
    waitUser.registrationId,
    waitUser.masterclassId,
    waitUser.email
  );

  /* Promote to CONFIRMED */
  await conn.query(
    `UPDATE registrations
     SET status = 'CONFIRMED', qrCode = ?
     WHERE id = ?`,
    [qr.qrCode, waitUser.id]
  );

  /* Increment booked count */
  await conn.query(
    `UPDATE masterclasses SET bookedCount = bookedCount + 1 WHERE id = ?`,
    [masterclassId]
  );

  return {
    ...waitUser,
    qrCode: qr.qrCode,
  };
}

/* ================= EMAIL HELPERS ================= */
async function sendCancellationEmail(email, sessionTitle) {
  await transporter.sendMail({
    to: email,
    subject: `❌ Registration Cancelled - ${sessionTitle}`,
    html: `
      <h2>Registration Cancelled</h2>
      <p>Your registration for <strong>${sessionTitle}</strong> has been cancelled.</p>
      <p>If this was a mistake, please register again if spots are available.</p>
    `,
  });
}

async function sendPromotionEmail(email, name, sessionTitle, qrCode, startTime) {
  await transporter.sendMail({
    to: email,
    subject: `🎉 Seat Confirmed - ${sessionTitle}`,
    html: `
      <h2>Good News, ${name}!</h2>
      <p>A seat has become available for <strong>${sessionTitle}</strong></p>
      <p><strong>Time:</strong> ${new Date(startTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</p>
      <p>Please present this QR code at the venue:</p>
      <img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
    `,
  });
}
