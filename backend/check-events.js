const db = require('./config/database');

async function checkEvents() {
  try {
    console.log('🔍 Checking events table structure and data...\n');

    // Check events table
    console.log('📋 EVENTS TABLE:');
    const events = await db.query('SELECT * FROM events LIMIT 5');
    console.log('Events found:', events.length);
    if (events.length > 0) {
      console.log('Sample event:', JSON.stringify(events[0], null, 2));
    }

    // Check masterclasses table
    console.log('\n📋 MASTERCLASSES TABLE:');
    const masterclasses = await db.query('SELECT * FROM masterclasses LIMIT 5');
    console.log('Masterclasses found:', masterclasses.length);
    if (masterclasses.length > 0) {
      console.log('Sample masterclass:', JSON.stringify(masterclasses[0], null, 2));
    }

    // Check registrations table
    console.log('\n📋 REGISTRATIONS TABLE:');
    const registrations = await db.query('SELECT * FROM registrations LIMIT 5');
    console.log('Registrations found:', registrations.length);
    if (registrations.length > 0) {
      console.log('Sample registration:', JSON.stringify(registrations[0], null, 2));
    }

    // Check waitlists table
    console.log('\n📋 WAITLISTS TABLE:');
    const waitlists = await db.query('SELECT * FROM waitlists LIMIT 5');
    console.log('Waitlist entries found:', waitlists.length);
    if (waitlists.length > 0) {
      console.log('Sample waitlist entry:', JSON.stringify(waitlists[0], null, 2));
    }

    console.log('\n✅ Database check completed successfully');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkEvents();
