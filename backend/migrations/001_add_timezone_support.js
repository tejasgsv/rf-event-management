/**
 * Migration: Add Timezone Support to Events
 * Run this once during deployment
 */

const db = require('../config/database');

const addTimezoneSupport = async () => {
  try {
    console.log('🔄 Adding timezone support to events table...');

    const connection = await db.getConnection();

    // Check if column exists
    const checkColumn = `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'events' AND COLUMN_NAME = 'venue_timezone'
    `;

    const [columns] = await connection.query(checkColumn);

    if (columns.length === 0) {
      // Add venue_timezone column with default
      await connection.query(`
        ALTER TABLE events
        ADD COLUMN venue_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata' AFTER venue
      `);
      console.log('✅ Added venue_timezone column');
    } else {
      console.log('ℹ️ venue_timezone column already exists');
    }

    // Update existing events to have timezone (you can customize this)
    await connection.query(`
      UPDATE events
      SET venue_timezone = CASE
        WHEN venue LIKE '%Dubai%' THEN 'Asia/Dubai'
        WHEN venue LIKE '%Mumbai%' THEN 'Asia/Kolkata'
        WHEN venue LIKE '%Delhi%' THEN 'Asia/Kolkata'
        WHEN venue LIKE '%London%' THEN 'Europe/London'
        WHEN venue LIKE '%New York%' THEN 'America/New_York'
        ELSE 'Asia/Kolkata'
      END
      WHERE venue_timezone = 'Asia/Kolkata'
    `);

    console.log('✅ Updated existing events with correct timezones');

    connection.release();
    return { success: true, message: 'Timezone migration completed' };
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
};

// Run if executed directly
if (require.main === module) {
  addTimezoneSupport()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addTimezoneSupport;
