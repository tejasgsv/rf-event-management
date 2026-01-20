const db = require('./config/database');
const bcryptjs = require('bcryptjs');

async function seedMySQL() {
  try {
    console.log('🌱 Seeding MySQL database with sample data...\n');

    // Create sample event
    console.log('📅 Creating sample event...');
    const eventResult = await db.query(`
      INSERT INTO events (name, startDate, endDate, venue, description, helpdeskContact, emergencyContact)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=id
    `, [
      'RF Tech Conference 2025',
      new Date('2025-02-15'),
      new Date('2025-02-16'),
      'Grand Convention Center, New York',
      'Annual RF Technology Conference featuring industry leaders and cutting-edge innovations.',
      '+1 (555) 123-4567',
      '+1 (555) 987-6543'
    ]);
    console.log('✅ Sample event created');

    // Get the event ID
    const [eventRows] = await db.query('SELECT id FROM events WHERE name = ?', ['RF Tech Conference 2025']);
    const eventId = eventRows[0].id;

    // Create sample masterclasses
    console.log('🎓 Creating sample masterclasses...');
    const masterclasses = [
      {
        title: 'React Advanced Patterns',
        description: 'Learn advanced React patterns including hooks, context, and performance optimization techniques.',
        startTime: new Date('2025-02-15T10:00:00'),
        endTime: new Date('2025-02-15T11:30:00'),
        location: 'Hall A',
        capacity: 50,
        bookedCount: 15,
        registrationCloseTime: new Date('2025-02-15T09:00:00'),
        waitlistCloseTime: new Date('2025-02-15T09:30:00'),
      },
      {
        title: 'Node.js Microservices',
        description: 'Build scalable microservices with Node.js, Docker, and Kubernetes.',
        startTime: new Date('2025-02-15T12:00:00'),
        endTime: new Date('2025-02-15T13:30:00'),
        location: 'Hall B',
        capacity: 40,
        bookedCount: 40, // Full - for testing waitlist
        registrationCloseTime: new Date('2025-02-15T11:00:00'),
        waitlistCloseTime: new Date('2025-02-15T11:30:00'),
      },
      {
        title: 'AI in Web Development',
        description: 'Explore how AI can enhance web development workflows and user experiences.',
        startTime: new Date('2025-02-15T14:00:00'),
        endTime: new Date('2025-02-15T15:30:00'),
        location: 'Hall C',
        capacity: 60,
        bookedCount: 45,
        registrationCloseTime: new Date('2025-02-15T13:00:00'),
        waitlistCloseTime: new Date('2025-02-15T13:30:00'),
      },
      {
        title: 'Cybersecurity Best Practices',
        description: 'Essential security practices for modern web applications and APIs.',
        startTime: new Date('2025-02-16T10:00:00'),
        endTime: new Date('2025-02-16T11:30:00'),
        location: 'Hall A',
        capacity: 45,
        bookedCount: 30,
        registrationCloseTime: new Date('2025-02-16T09:00:00'),
        waitlistCloseTime: new Date('2025-02-16T09:30:00'),
      },
      {
        title: 'Cloud Architecture Design',
        description: 'Design scalable and cost-effective cloud architectures using AWS, Azure, and GCP.',
        startTime: new Date('2025-02-16T12:00:00'),
        endTime: new Date('2025-02-16T13:30:00'),
        location: 'Hall B',
        capacity: 55,
        bookedCount: 50,
        registrationCloseTime: new Date('2025-02-16T11:00:00'),
        waitlistCloseTime: new Date('2025-02-16T11:30:00'),
      }
    ];

    for (const mc of masterclasses) {
      await db.query(`
        INSERT INTO masterclasses (eventId, title, description, startTime, endTime, location, capacity, bookedCount, registrationCloseTime, waitlistCloseTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id=id
      `, [
        eventId,
        mc.title,
        mc.description,
        mc.startTime,
        mc.endTime,
        mc.location,
        mc.capacity,
        mc.bookedCount,
        mc.registrationCloseTime,
        mc.waitlistCloseTime
      ]);
    }
    console.log('✅ Sample masterclasses created');

    // Create sample admin user
    console.log('👤 Creating sample admin user...');
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
    await db.query(`
      INSERT INTO admins (email, password, role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE email=email
    `, ['admin@rf-events.com', hashedPassword, 'superadmin']);
    console.log('✅ Sample admin user created');

    // Create some sample registrations for the full masterclass (for testing waitlist)
    console.log('📝 Creating sample registrations...');
    const [fullMasterclassRows] = await db.query('SELECT id FROM masterclasses WHERE title = ? AND capacity = 40', ['Node.js Microservices']);
    if (fullMasterclassRows.length > 0) {
      const fullMasterclassId = fullMasterclassRows[0].id;

      // Create some registrations that are WAITLISTED
      const waitlistRegistrations = [
        { name: 'John Doe', surname: 'Smith', email: 'john@example.com', mobile: '+1234567890', status: 'WAITLISTED' },
        { name: 'Jane Doe', surname: 'Johnson', email: 'jane@example.com', mobile: '+1234567891', status: 'WAITLISTED' },
      ];

      for (const reg of waitlistRegistrations) {
        const registrationId = `REG-${fullMasterclassId.toString().slice(-8).toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

            await db.query(`
              INSERT INTO registrations (eventId, masterclassId, registrationId, name, surname, email, mobile, company, jobTitle, country, postalCode, accessibilityNeeds, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE id=id
            `, [
              eventId,
              fullMasterclassId,
              registrationId,
              reg.name,
              reg.surname,
              reg.email,
              reg.mobile,
              reg.company || null,
              reg.jobTitle || null,
              reg.country || null,
              reg.postalCode || null,
              reg.accessibilityNeeds || null,
              reg.status
            ]);

        // Add to waitlist table
        const [maxPosResult] = await db.query('SELECT MAX(position) as maxPos FROM waitlists WHERE masterclassId = ?', [fullMasterclassId]);
        const maxPos = maxPosResult[0]?.maxPos || 0;
        const position = maxPos + 1;

        await db.query(`
          INSERT INTO waitlists (masterclassId, name, email, position)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE id=id
        `, [
          fullMasterclassId,
          `${reg.name} ${reg.surname}`,
          reg.email,
          position
        ]);
      }
      console.log('✅ Sample waitlist entries created');
    }

    console.log('\n════════════════════════════════════');
    console.log('✅ MySQL database seeded successfully!');
    console.log('════════════════════════════════════');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email: admin@rf-events.com');
    console.log('   Password: admin123');
    console.log('\n🎫 Masterclasses Created:');
    console.log('   1. React Advanced Patterns (15/50 seats)');
    console.log('   2. Node.js Microservices (40/40 seats - FULL with waitlist)');
    console.log('   3. AI in Web Development (45/60 seats)');
    console.log('   4. Cybersecurity Best Practices (30/45 seats)');
    console.log('   5. Cloud Architecture Design (50/55 seats)');
    console.log('\n🌐 Access Application:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend API: http://localhost:5000');
    console.log('\n🧪 Test API Endpoints:');
    console.log('   GET /api/admin/dashboard - View dashboard');
    console.log('   GET /api/admin/waitlist - View waitlist');
    console.log('   GET /api/admin/registrations - View registrations');
    console.log('════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ MySQL seeding failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

seedMySQL();
