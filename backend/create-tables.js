const db = require('./config/database');

async function createTables() {
  try {
    console.log('Creating database tables...');

    // Create admins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Admins table created');

    // Create events table
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        venue VARCHAR(255) NOT NULL,
        description TEXT,
        helpdeskContact VARCHAR(255),
        emergencyContact VARCHAR(255),
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_startDate (startDate),
        INDEX idx_endDate (endDate)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Events table created');

    // Create masterclasses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS masterclasses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        startTime DATETIME NOT NULL,
        endTime DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        speakerId INT DEFAULT NULL,
        status ENUM('DRAFT','LIVE','CANCELLED') DEFAULT 'DRAFT',
        bookedCount INT DEFAULT 0,
        registrationCloseTime DATETIME NOT NULL,
        waitlistCloseTime DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
        INDEX idx_event_status (eventId, status),
        INDEX idx_eventId_startTime (eventId, startTime),
        INDEX idx_startTime (startTime)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Masterclasses table created');

    // Backfill missing columns for existing environments
    try {
      await db.query("ALTER TABLE masterclasses ADD COLUMN status ENUM('DRAFT','LIVE','CANCELLED') DEFAULT 'DRAFT'");
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) throw err;
    }

    try {
      await db.query("ALTER TABLE masterclasses ADD COLUMN speakerId INT NULL");
    } catch (err) {
      if (!err.message.includes('Duplicate column name')) throw err;
    }

    try {
      await db.query("ALTER TABLE masterclasses ADD INDEX idx_event_status (eventId, status)");
    } catch (err) {
      if (!err.message.includes('Duplicate key name')) throw err;
    }

    console.log('🔧 Masterclasses table patched (status, speakerId)');

    // Create registrations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT NOT NULL,
        masterclassId INT NOT NULL,
        registrationId VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        company VARCHAR(255),
        jobTitle VARCHAR(255),
        country VARCHAR(100),
        postalCode VARCHAR(20),
        accessibilityNeeds TEXT,
        status ENUM('CONFIRMED', 'WAITLISTED', 'CANCELLED') DEFAULT 'CONFIRMED',
        qrCode LONGTEXT,
        qrToken VARCHAR(255) UNIQUE,
        qrData TEXT,
        emailHash VARCHAR(255),
        checkedIn BOOLEAN DEFAULT FALSE,
        checkedInAt DATETIME,
        checkedInBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (masterclassId) REFERENCES masterclasses(id) ON DELETE CASCADE,
        FOREIGN KEY (checkedInBy) REFERENCES admins(id) ON DELETE SET NULL,
        INDEX idx_masterclassId_email_status (masterclassId, email, status),
        INDEX idx_email_status (email, status),
        INDEX idx_qrToken (qrToken),
        INDEX idx_eventId_status (eventId, status),
        INDEX idx_email (email),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Registrations table created');

    // Create waitlists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS waitlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        masterclassId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        position INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masterclassId) REFERENCES masterclasses(id) ON DELETE CASCADE,
        INDEX idx_masterclassId_position (masterclassId, position),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Waitlists table created');

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}

createTables();
