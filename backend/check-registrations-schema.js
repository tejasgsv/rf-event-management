const db = require('./config/database');

async function checkSchema() {
  try {
    const [rows] = await db.query('DESCRIBE registrations');
    console.log('\n📋 REGISTRATIONS TABLE STRUCTURE:\n');
    rows.forEach(r => {
      console.log(`  ${r.Field.padEnd(25)} ${r.Type.padEnd(30)} ${r.Null === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });
    
    const [indexRows] = await db.query('SHOW INDEX FROM registrations');
    console.log('\n🔑 INDEXES:\n');
    indexRows.forEach(idx => {
      if (idx.Key_name !== 'PRIMARY') {
        console.log(`  ${idx.Key_name}: ${idx.Column_name}`);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
