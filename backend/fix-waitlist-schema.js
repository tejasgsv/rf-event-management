const db = require('./config/database');

async function fixSchema() {
  try {
    // Check if session_id exists in waitlist
    const [rows] = await db.query('DESCRIBE waitlist');
    const hasSessionId = rows.some(r => r.Field === 'session_id');
    
    if (!hasSessionId) {
      console.log('🔧 Adding session_id column to waitlist table...');
      await db.query(`
        ALTER TABLE waitlist 
        ADD COLUMN session_id INT(11) NOT NULL DEFAULT 0 AFTER event_id
      `);
      console.log('✅ session_id column added to waitlist');
    } else {
      console.log('✅ session_id column already exists in waitlist');
    }
    
    // Check if position column exists
    const hasPosition = rows.some(r => r.Field === 'position');
    if (!hasPosition) {
      console.log('🔧 Adding position column to waitlist table...');
      await db.query(`
        ALTER TABLE waitlist 
        ADD COLUMN position INT(11) DEFAULT 0 AFTER session_id
      `);
      console.log('✅ position column added to waitlist');
    }
    
    // Create index on session_id
    try {
      await db.query('CREATE INDEX idx_session_id ON waitlist(session_id)');
      console.log('✅ Index created on session_id');
    } catch (e) {
      // Index might already exist
      console.log('ℹ️  Index may already exist on session_id');
    }
    
    console.log('\n✅ Waitlist schema fix complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixSchema();
