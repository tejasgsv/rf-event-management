/**
 * Production-Ready: Waitlist Promotion with Sequential Locking
 * Prevents race conditions during cancellations + promotions
 * 
 * Key Safety Features:
 * - SELECT ... FOR UPDATE locks on both masterclass and waitlist
 * - Idempotency check for failed promotions
 * - Failed email queue for retries
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const nodemailer = require('nodemailer');
const { generateCompleteQR } = require('../utils/qrGenerator');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Promote user from waitlist to confirmed (with full safety)
 * Called when a confirmed registration is cancelled
 */
const promoteFromWaitlist = async (masterclassId) => {
  const conn = await db.pool.getConnection();
  await conn.beginTransaction();

  try {
    console.log(`🔄 Starting waitlist promotion for masterclass ${masterclassId}`);

    // Step 1: Lock masterclass to prevent concurrent promotions
    const [[session]] = await conn.query(
      `SELECT id, capacity, bookedCount, eventId, title, startTime 
       FROM masterclasses 
       WHERE id = ? FOR UPDATE`,
      [masterclassId]
    );

    if (!session) {
      await conn.rollback();
      console.log(`⚠️ Masterclass ${masterclassId} not found`);
      return { success: false, message: 'Session not found' };
    }

    // Check if there's still available capacity
    if (session.bookedCount >= session.capacity) {
      await conn.rollback();
      console.log(`⚠️ No capacity available in masterclass ${masterclassId}`);
      return { success: false, message: 'No capacity available' };
    }

    // Step 2: Lock and get the first user in waitlist
    const [[firstInWaitlist]] = await conn.query(
      `SELECT id, name, email, position 
       FROM waitlists 
       WHERE masterclassId = ?
       ORDER BY position ASC 
       LIMIT 1 
       FOR UPDATE`,
      [masterclassId]
    );

    if (!firstInWaitlist) {
      await conn.rollback();
      console.log(`ℹ️ No pending waitlist entries for masterclass ${masterclassId}`);
      return { success: false, message: 'No users in waitlist' };
    }

    const userEmail = firstInWaitlist.email;
    const waitlistId = firstInWaitlist.id;
    const waitlistPosition = firstInWaitlist.position;
    const [firstName, ...restName] = (firstInWaitlist.name || 'Guest').trim().split(/\s+/);
    const lastName = restName.join(' ');

    console.log(`✓ Locked: User ${userEmail} at position ${firstInWaitlist.position}`);

    // Step 3: Check for idempotency (has this user already been promoted?)
    const [[alreadyPromoted]] = await conn.query(
      `SELECT id FROM registrations 
       WHERE masterclassId = ? AND email = ? AND status = 'CONFIRMED'`,
      [masterclassId, userEmail]
    );

    if (alreadyPromoted) {
      // User was already promoted; just update waitlist status
      await conn.query(`DELETE FROM waitlists WHERE id = ?`, [waitlistId]);
      await conn.query(
        `UPDATE waitlists SET position = position - 1
         WHERE masterclassId = ? AND position > ?`,
        [masterclassId, waitlistPosition]
      );
      await conn.commit();
      console.log(`✓ Idempotency: User ${userEmail} already confirmed, updated waitlist`);
      return { success: true, message: 'Already promoted', idempotent: true };
    }

    // Step 4: Create confirmed registration
    const [[waitlistedReg]] = await conn.query(
      `SELECT registrationId FROM registrations
       WHERE masterclassId = ? AND email = ? AND status = 'WAITLISTED'
       LIMIT 1 FOR UPDATE`,
      [masterclassId, userEmail]
    );

    const registrationId = waitlistedReg?.registrationId || `REG-${uuidv4().slice(0, 8).toUpperCase()}`;
    const { qrCode } = await generateCompleteQR(registrationId, masterclassId);

    if (waitlistedReg?.registrationId) {
      await conn.query(
        `UPDATE registrations
         SET status = 'CONFIRMED', qrCode = ?, updatedAt = NOW()
         WHERE registrationId = ?`,
        [qrCode, registrationId]
      );
    } else {
      await conn.query(
        `INSERT INTO registrations 
         (registrationId, eventId, masterclassId, name, surname, email, mobile, status, qrCode, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, NOW())`,
        [registrationId, session.eventId, masterclassId, firstName, lastName, userEmail, 'N/A', qrCode]
      );
    }

    console.log(`✓ Created registration for ${userEmail}`);

    // Step 5: Update waitlist status
    await conn.query(`DELETE FROM waitlists WHERE id = ?`, [waitlistId]);

    // Step 6: Update masterclass booked count
    await conn.query(
      `UPDATE masterclasses SET bookedCount = bookedCount + 1 WHERE id = ?`,
      [masterclassId]
    );

    // Step 7: Reorder remaining waitlist positions
    await conn.query(
      `UPDATE waitlists SET position = position - 1
       WHERE masterclassId = ? AND position > ?`,
      [masterclassId, waitlistPosition]
    );

    await conn.commit();

    console.log(`✓ Promotion complete for ${userEmail}`);

    // Step 8: Send email (OUTSIDE transaction to avoid rollback on email failure)
    try {
      await transporter.sendMail({
        to: userEmail,
        subject: `🎉 Great News! You're Confirmed for ${session.title}`,
        html: `
          <h2>Congratulations!</h2>
          <p>A seat has become available! You've been promoted from the waitlist.</p>
          <p><strong>Session:</strong> ${session.title}</p>
          <p><strong>Time:</strong> ${new Date(session.startTime).toLocaleString()}</p>
          <p><strong>Your QR Code:</strong> <a href="${qrCode}">View Here</a></p>
          <p>See you at the event!</p>
        `
      });
      console.log(`✓ Promotion email sent to ${userEmail}`);
    } catch (emailErr) {
      console.error(`⚠️ Email failed for ${userEmail}, adding to retry queue:`, emailErr);
      
      // Add to failed queue for retry
      try {
        await db.query(
          `INSERT INTO email_failed_queue 
           (masterclassId, email, type, registrationId, attemptCount, lastError)
           VALUES (?, ?, 'PROMOTION', ?, 1, ?)`,
          [masterclassId, userEmail, registrationId, emailErr.message]
        );
      } catch (queueErr) {
        console.error(`❌ Failed to queue email retry:`, queueErr);
      }
    }

    return { 
      success: true, 
      message: `${userEmail} promoted from waitlist`,
      promotedUser: userEmail
    };

  } catch (err) {
    await conn.rollback();
    console.error(`❌ Promotion failed:`, err);
    return { success: false, message: err.message };
  } finally {
    conn.release();
  }
};

/**
 * Retry failed promotion emails (call periodically via cron)
 */
const retryFailedEmails = async () => {
  try {
    const [failedQueue] = await db.query(
      `SELECT id, email, masterclassId, registrationId, attemptCount 
       FROM email_failed_queue 
       WHERE status = 'PENDING' AND attemptCount < 5
       LIMIT 10`
    );

    for (const item of failedQueue) {
      try {
        const [[session]] = await db.query(
          `SELECT title, startTime FROM masterclasses WHERE id = ?`,
          [item.masterclassId]
        );

        const [[reg]] = await db.query(
          `SELECT qrCode FROM registrations WHERE id = ?`,
          [item.registrationId]
        );

        await transporter.sendMail({
          to: item.email,
          subject: `🎉 Your Confirmed Seat - ${session.title}`,
          html: `
            <h2>Congratulations!</h2>
            <p>Your QR Code: <a href="${reg.qrCode}">View Here</a></p>
          `
        });

        await db.query(
          `UPDATE email_failed_queue SET status = 'SUCCESS' WHERE id = ?`,
          [item.id]
        );

        console.log(`✓ Retry successful for ${item.email}`);
      } catch (retryErr) {
        await db.query(
          `UPDATE email_failed_queue 
           SET attemptCount = attemptCount + 1, lastError = ?
           WHERE id = ?`,
          [retryErr.message, item.id]
        );
        console.error(`⚠️ Retry ${item.attemptCount + 1} failed for ${item.email}`);
      }
    }
  } catch (err) {
    console.error('❌ Failed email retry job:', err);
  }
};

module.exports = {
  promoteFromWaitlist,
  retryFailedEmails
};
