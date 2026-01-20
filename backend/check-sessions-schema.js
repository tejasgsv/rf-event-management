const db = require('./config/database');

async function checkSessionsTable() {
  try {
    const [cols] = await db.query('DESCRIBE sessions');
    console.log('\n📋 SESSIONS TABLE STRUCTURE:');
    cols.forEach(c => console.log(`   ${c.Field}: ${c.Type}`));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSessionsTable();
