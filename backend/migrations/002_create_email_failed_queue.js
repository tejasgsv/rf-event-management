/**
 * Migration: Create email_failed_queue table
 * Purpose: Store failed emails for retry with exponential backoff
 * Safe: Idempotent - checks for existing table before creation
 */

const db = require('../config/database');

const createEmailFailedQueueTable = async () => {
  try {
    console.log('🔍 Checking for email_failed_queue table...');

    const [tables] = await db.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'email_failed_queue' AND TABLE_SCHEMA = DATABASE()`
    );

    if (tables.length > 0) {
      console.log('✓ Table already exists, skipping creation');
      return { success: true, message: 'Table exists' };
    }

    console.log('📝 Creating email_failed_queue table...');

    await db.query(`
      CREATE TABLE email_failed_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        masterclassId INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        type ENUM('PROMOTION', 'CANCELLATION', 'FEEDBACK', 'REMINDER') DEFAULT 'PROMOTION',
        registrationId VARCHAR(100),
        attemptCount INT DEFAULT 1,
        lastError TEXT,
        status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_status (status),
        INDEX idx_masterclass (masterclassId),
        INDEX idx_email (email),
        FOREIGN KEY (masterclassId) REFERENCES masterclasses(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ email_failed_queue table created successfully');
    return { success: true, message: 'Table created' };

  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('✓ Table already exists');
      return { success: true, message: 'Table exists' };
    }
    console.error('❌ Migration failed:', err);
    throw err;
  }
};

// Run migration
if (require.main === module) {
  createEmailFailedQueueTable()
    .then(result => {
      console.log('✅ Migration complete:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { createEmailFailedQueueTable };
