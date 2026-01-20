const db = require('./config/database');

async function checkSchema() {
  try {
    console.log('\n📋 WAITLIST TABLE STRUCTURE:\n');
    const [rows] = await db.query('DESCRIBE waitlist');
    rows.forEach(r => {
      console.log(`  ${r.Field.padEnd(25)} ${r.Type.padEnd(30)} ${r.Null === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
