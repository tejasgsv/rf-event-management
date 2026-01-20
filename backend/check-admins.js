const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/database');

async function checkAdmins() {
  try {
    console.log('Checking admins table...');

    // Check table structure
    const [structure] = await db.query('DESCRIBE admins');
    console.log('Table structure:');
    structure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`);
    });

    // Check admin users
    const [admins] = await db.query('SELECT * FROM admins');
    console.log(`\nFound ${admins.length} admin user(s):`);
    admins.forEach((admin, i) => {
      console.log(`User ${i+1}:`, {
        id: admin.id,
        email: admin.email,
        passwordField: Object.keys(admin).find(k => k.toLowerCase().includes('pass')),
        passwordLength: admin.password?.length || admin.password_hash?.length || 0,
        passwordPrefix: admin.password ? admin.password.substring(0, 4) : 'N/A'
      });
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAdmins();
