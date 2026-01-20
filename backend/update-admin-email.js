const db = require('./config/database');

async function updateAdminEmail() {
  try {
    const [result] = await db.query(
      'UPDATE admins SET email = ? WHERE email = ?',
      ['admin@rf-events.com', 'admin@rf-event.com']
    );
    
    console.log('✅ Admin email updated successfully');
    console.log(`   Changed: admin@rf-event.com → admin@rf-events.com`);
    console.log(`   Rows affected: ${result.affectedRows}`);
    
    // Verify
    const [admins] = await db.query('SELECT email, role FROM admins');
    console.log('\n📋 Current admins:');
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

updateAdminEmail();
