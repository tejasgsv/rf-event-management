const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/database');
const crypto = require('crypto');

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    console.log(`🔌 Connecting to DB at ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

    // Hash password using SHA256 (matching adminController.js)
    const hashedPassword = crypto
      .createHash('sha256')
      .update('admin123')
      .digest('hex');

    // Insert or update admin
    const result = await db.query(
      'INSERT INTO admins (email, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      ['admin@rf-event.com', hashedPassword]
    );

    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email: admin@rf-event.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
