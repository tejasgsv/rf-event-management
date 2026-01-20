const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./config/database');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...\n');

    // Temporarily disable FK checks for clean drops
    try {
      await db.query('SET FOREIGN_KEY_CHECKS=0');
    } catch (_) {}

    // Drop existing tables first
    const dropStatements = [
      'DROP TABLE IF EXISTS waitlists',
      'DROP TABLE IF EXISTS registrations',
      'DROP TABLE IF EXISTS masterclasses',
      'DROP TABLE IF EXISTS events',
      'DROP TABLE IF EXISTS admins'
    ];

    console.log('🗑️  Dropping existing tables...\n');
    for (const stmt of dropStatements) {
      try {
        await db.query(stmt);
        console.log(`✅ Dropped table if exists`);
      } catch (err) {
        console.log(`⚠️  Could not drop table: ${err.message}`);
      }
    }

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database.sql');
    let sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Strip out single-line comments and MySQL client directives fully before splitting
    // Remove all lines starting with --
    sqlContent = sqlContent.replace(/^\s*--.*$/mg, '');
    // Remove CREATE DATABASE/USE statements (we already ensured DB exists via create-db.js)
    sqlContent = sqlContent.replace(/CREATE\s+DATABASE[\s\S]*?;/ig, '');
    sqlContent = sqlContent.replace(/USE\s+`?[\w-]+`?\s*;?/ig, '');

    // Split by semicolon boundaries and clean
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(statement);
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await db.query(statement);
        } catch (err) {
          // Ignore table already exists errors
          if (!err.message.includes('already exists')) {
            console.error(`❌ Error executing statement ${i + 1}:`, err.message);
            throw err;
          } else {
            console.log(`⚠️  Table already exists, skipping...`);
          }
        }
      }
    }

    console.log('\n✅ Database setup completed successfully!');

    // Now seed with sample data
    console.log('\n🌱 Seeding database with sample data...');
    const seedFile = path.join(__dirname, 'seed-mysql.js');
    if (fs.existsSync(seedFile)) {
      require(seedFile);
      console.log('✅ Sample data seeded successfully!');
    } else {
      console.log('⚠️  No MySQL seed file found, skipping seeding');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    try { await db.query('SET FOREIGN_KEY_CHECKS=1'); } catch (_) {}
    process.exit(0);
  }
}

setupDatabase();
