/**
 * 🌱 Speaker Seeding Script
 * Automatically populates the speakers table with sample data
 * Safe: Checks for existing speakers before inserting
 * Usage: node backend/scripts/seed-speakers.js
 */

const db = require('../config/database');

const SAMPLE_SPEAKERS = [
  {
    name: 'Dr. Sourav Maurya',
    title: 'Program Director',
    designation: 'Program Director',
    organization: 'Reliance Foundation',
    bio: 'Visionary leader with expertise in educational program development and implementation across India. Drives strategic initiatives to maximize impact in rural education.',
    photo: 'https://ui-avatars.com/api/?name=Dr.+Sourav+Maurya&background=random',
    email: 'sourav.maurya@reliancefoundation.org',
    linkedin: 'https://linkedin.com/in/sourav-maurya',
    twitter: '@souravmaurya'
  },
  {
    name: 'Farida Taraporwala',
    title: 'Coordinator',
    designation: 'Coordinator',
    organization: 'Education Initiative',
    bio: 'Passionate educator focused on foundational learning and student empowerment. Has mentored thousands of students through innovative teaching methodologies.',
    photo: 'https://ui-avatars.com/api/?name=Farida+Taraporwala&background=random',
    email: 'farida@educationinitiative.org',
    linkedin: 'https://linkedin.com/in/farida-taraporwala',
    twitter: '@tarafarida'
  },
  {
    name: 'Amit Patel',
    title: 'Senior Trainer',
    designation: 'Senior Trainer',
    organization: 'Skill India',
    bio: 'Expert in teacher capacity building with over 15 years of experience. Specializes in training educators to adopt modern pedagogical techniques.',
    photo: 'https://ui-avatars.com/api/?name=Amit+Patel&background=random',
    email: 'amit.patel@skillindia.org',
    linkedin: 'https://linkedin.com/in/amit-patel',
    twitter: '@amitpatel'
  },
  {
    name: 'Priya Sharma',
    title: 'Education Strategist',
    designation: 'Education Strategist',
    organization: 'National Institute of Education',
    bio: 'Strategic thinker with a mission to transform education through policy and implementation. Advises governments and organizations on scalable educational solutions.',
    photo: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
    email: 'priya.sharma@nie.org',
    linkedin: 'https://linkedin.com/in/priya-sharma',
    twitter: '@priyasharma'
  },
  {
    name: 'Rajesh Kumar',
    title: 'Head of Curriculum Development',
    designation: 'Head of Curriculum Development',
    organization: 'NITI Aayog',
    bio: 'Curriculum expert focused on designing and implementing modern, competency-based educational frameworks for student success.',
    photo: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
    email: 'rajesh.kumar@niti.org',
    linkedin: 'https://linkedin.com/in/rajesh-kumar',
    twitter: '@rajeshkumar'
  },
  {
    name: 'Dr. Neha Gupta',
    title: 'Research Director',
    designation: 'Research Director',
    organization: 'Centre for Educational Technology',
    bio: 'Leading research in educational technology adoption. Drives evidence-based initiatives to improve learning outcomes using digital tools.',
    photo: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=random',
    email: 'neha.gupta@cettech.org',
    linkedin: 'https://linkedin.com/in/neha-gupta',
    twitter: '@nehagupta'
  },
  {
    name: 'Vikram Singh',
    title: 'Policy Advisor',
    designation: 'Policy Advisor',
    organization: 'Ministry of Education',
    bio: 'Policy expert with deep knowledge of education sector regulations. Shapes national policies for educational excellence and accessibility.',
    photo: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=random',
    email: 'vikram.singh@moe.gov.in',
    linkedin: 'https://linkedin.com/in/vikram-singh',
    twitter: '@vikramsingh'
  },
  {
    name: 'Dr. Anjali Desai',
    title: 'Chief Learning Officer',
    designation: 'Chief Learning Officer',
    organization: 'Digital Learning Foundation',
    bio: 'Champion of digital literacy and inclusive education. Pioneers innovative approaches to bridge the digital divide in education.',
    photo: 'https://ui-avatars.com/api/?name=Anjali+Desai&background=random',
    email: 'anjali.desai@dlf.org',
    linkedin: 'https://linkedin.com/in/anjali-desai',
    twitter: '@anjalidesai'
  }
];

const seedSpeakers = async () => {
  try {
    console.log('🌱 Starting speaker seeding...');
    
    // Check if speakers table exists
    const [tables] = await db.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'speakers' AND TABLE_SCHEMA = DATABASE()`
    );

    if (tables.length === 0) {
      console.error('❌ Speakers table does not exist. Please run database setup first.');
      process.exit(1);
    }

    // Check for existing speakers
    const [[existingCount]] = await db.query('SELECT COUNT(*) as count FROM speakers');
    
    if (existingCount.count > 0) {
      console.log(`✅ Speakers table already has ${existingCount.count} speakers. Skipping seed.`);
      console.log('   To reset, run: DELETE FROM speakers;');
      process.exit(0);
    }

    // Insert sample speakers
    let insertedCount = 0;
    
    for (const speaker of SAMPLE_SPEAKERS) {
      try {
        const [result] = await db.query(
          `INSERT INTO speakers 
           (name, title, designation, organization, bio, photo, email, linkedin, twitter) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            speaker.name,
            speaker.title,
            speaker.designation,
            speaker.organization,
            speaker.bio,
            speaker.photo,
            speaker.email,
            speaker.linkedin,
            speaker.twitter
          ]
        );

        if (result.affectedRows > 0) {
          insertedCount++;
          console.log(`✅ Inserted: ${speaker.name}`);
        }
      } catch (err) {
        console.error(`⚠️ Failed to insert ${speaker.name}:`, err.message);
      }
    }

    console.log(`\n✅ Seeding complete: ${insertedCount}/${SAMPLE_SPEAKERS.length} speakers inserted`);

    // Verify count
    const [[finalCount]] = await db.query('SELECT COUNT(*) as count FROM speakers');
    console.log(`📊 Total speakers in database: ${finalCount.count}`);

    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedSpeakers();
}

module.exports = { seedSpeakers, SAMPLE_SPEAKERS };
