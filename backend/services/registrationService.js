const db = require('../config/database');

const getConfirmedCount = async (conn, masterclassId) => {
  const [[row]] = await conn.query(
    `SELECT COUNT(*) as confirmed FROM registrations
     WHERE masterclassId = ? AND status = 'CONFIRMED'`,
    [masterclassId]
  );
  return row?.confirmed || 0;
};

const addWaitlistEntry = async (conn, masterclassId, name, email) => {
  const [[posRow]] = await conn.query(
    `SELECT COALESCE(MAX(position), 0) as maxPos FROM waitlists WHERE masterclassId = ?`,
    [masterclassId]
  );

  const position = (posRow?.maxPos || 0) + 1;

  await conn.query(
    `INSERT INTO waitlists (masterclassId, name, email, position)
     VALUES (?, ?, ?, ?)`,
    [masterclassId, name, email, position]
  );

  return position;
};

const removeWaitlistEntry = async (conn, waitlistId, masterclassId, position) => {
  await conn.query(`DELETE FROM waitlists WHERE id = ?`, [waitlistId]);
  await conn.query(
    `UPDATE waitlists SET position = position - 1
     WHERE masterclassId = ? AND position > ?`,
    [masterclassId, position]
  );
};

module.exports = {
  getConfirmedCount,
  addWaitlistEntry,
  removeWaitlistEntry
};
