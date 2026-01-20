/**
 * Mock MySQL Database - For Development/Testing WITHOUT MySQL server
 * Stores data in memory for API testing
 */

// In-memory data store
const store = {
  admins: [
    {
      id: 1,
      email: 'admin@rf-event.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash of "admin123"
      created_at: new Date(),
    }
  ],
  events: [],
  masterclasses: [],
  registrations: [],
  waitlists: [],
};

/**
 * Mock query function - supports basic SELECT, INSERT, UPDATE, DELETE
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Results
 */
async function query(sql, params = []) {
  console.log(`[MOCK DB] Query: ${sql.substring(0, 60)}...`);

  // SELECT * FROM admins WHERE email = ?
  if (sql.includes('SELECT * FROM admins WHERE email')) {
    const email = params[0].toLowerCase();
    const result = store.admins.filter(a => a.email === email);
    return result;
  }

  // SELECT * FROM events
  if (sql.includes('SELECT * FROM events') && !sql.includes('WHERE')) {
    return store.events;
  }

  // SELECT * FROM events LIMIT 1
  if (sql.includes('SELECT * FROM events LIMIT 1')) {
    return store.events.slice(0, 1);
  }

  // SELECT id FROM events LIMIT 1
  if (sql.includes('SELECT id FROM events LIMIT 1')) {
    return store.events.slice(0, 1).map(e => ({ id: e.id }));
  }

  // SELECT * FROM events WHERE id
  if (sql.includes('SELECT * FROM events WHERE id')) {
    const id = params[0];
    return store.events.filter(e => e.id === id);
  }

  // INSERT INTO events
  if (sql.includes('INSERT INTO events')) {
    const eventId = store.events.length > 0 ? Math.max(...store.events.map(e => e.id)) + 1 : 1;
    const newEvent = {
      id: eventId,
      name: params[0],
      startDate: params[1],
      endDate: params[2],
      venue: params[3] || '',
      description: params[4] || '',
      helpdeskContact: params[5] || '',
      emergencyContact: params[6] || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.events.push(newEvent);
    return [{ insertId: eventId, affectedRows: 1 }];
  }

  // UPDATE events SET ... WHERE id = ?
  if (sql.includes('UPDATE events SET') && sql.includes('WHERE id = ?')) {
    const id = params[7]; // last param
    const event = store.events.find(e => e.id === id);
    if (event) {
      event.name = params[0];
      event.startDate = params[1];
      event.endDate = params[2];
      event.venue = params[3];
      event.description = params[4] || '';
      event.helpdeskContact = params[5] || '';
      event.emergencyContact = params[6] || '';
      event.updatedAt = new Date();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE FROM events
  if (sql.includes('DELETE FROM events')) {
    store.events = [];
    return { affectedRows: 1 };
  }

  // SELECT * FROM masterclasses
  if (sql.includes('SELECT * FROM masterclasses') && !sql.includes('WHERE')) {
    return store.masterclasses;
  }

  // SELECT * FROM masterclasses ORDER BY startTime ASC
  if (sql.includes('SELECT * FROM masterclasses ORDER BY startTime ASC')) {
    return store.masterclasses.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  // SELECT * FROM masterclasses WHERE eventId
  if (sql.includes('SELECT * FROM masterclasses WHERE eventId')) {
    const eventId = params[0];
    return store.masterclasses.filter(m => m.eventId === eventId);
  }

  // SELECT * FROM masterclasses WHERE id
  if (sql.includes('SELECT * FROM masterclasses WHERE id')) {
    const id = params[0];
    return store.masterclasses.filter(m => m.id === id);
  }

  // SELECT id FROM masterclasses WHERE eventId
  if (sql.includes('SELECT id FROM masterclasses WHERE eventId')) {
    const eventId = params[0];
    return store.masterclasses.filter(m => m.eventId === eventId).map(m => ({ id: m.id }));
  }

  // INSERT INTO masterclasses
  if (sql.includes('INSERT INTO masterclasses')) {
    const mcId = store.masterclasses.length > 0 ? Math.max(...store.masterclasses.map(m => m.id)) + 1 : 1;
    const newMC = {
      id: mcId,
      eventId: params[0],
      title: params[1],
      description: params[2] || '',
      startTime: params[3],
      endTime: params[4],
      location: params[5] || '',
      capacity: params[6] || 100,
      bookedCount: 0,
      registrationCloseTime: params[7],
      waitlistCloseTime: params[8],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.masterclasses.push(newMC);
    return [{ insertId: mcId, affectedRows: 1 }];
  }

  // UPDATE masterclasses SET ... WHERE id = ?
  if (sql.includes('UPDATE masterclasses SET') && sql.includes('WHERE id = ?')) {
    const id = params[8]; // last param
    const mc = store.masterclasses.find(m => m.id === id);
    if (mc) {
      mc.title = params[0];
      mc.description = params[1] || '';
      mc.startTime = params[2];
      mc.endTime = params[3];
      mc.location = params[4];
      mc.capacity = params[5];
      mc.registrationCloseTime = params[6];
      mc.waitlistCloseTime = params[7];
      mc.updatedAt = new Date();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE FROM masterclasses WHERE eventId
  if (sql.includes('DELETE FROM masterclasses WHERE eventId')) {
    const eventId = params[0];
    const initialLength = store.masterclasses.length;
    store.masterclasses = store.masterclasses.filter(m => m.eventId !== eventId);
    return { affectedRows: initialLength - store.masterclasses.length };
  }

  // DELETE FROM masterclasses WHERE id
  if (sql.includes('DELETE FROM masterclasses WHERE id')) {
    const id = params[0];
    const index = store.masterclasses.findIndex(m => m.id === id);
    if (index > -1) {
      store.masterclasses.splice(index, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // SELECT * FROM registrations
  if (sql.includes('SELECT * FROM registrations') && !sql.includes('WHERE')) {
    return store.registrations;
  }

  // INSERT INTO registrations
  if (sql.includes('INSERT INTO registrations')) {
    const regId = store.registrations.length > 0 ? Math.max(...store.registrations.map(r => r.id)) + 1 : 1;
    const newReg = {
      id: regId,
      eventId: params[0],
      masterclassId: params[1],
      registrationId: params[2],
      name: params[3],
      surname: params[4] || '',
      email: params[5],
      status: params[6] || 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.registrations.push(newReg);
    return [{ insertId: regId, affectedRows: 1 }];
  }

  // SELECT COUNT(*) as count FROM registrations
  if (sql.includes('SELECT COUNT(*) as count FROM registrations') && !sql.includes('WHERE')) {
    return [{ count: store.registrations.length }];
  }

  // SELECT COUNT(*) as count FROM registrations WHERE masterclassId = ? AND status = ?
  if (sql.includes('SELECT COUNT(*) as count FROM registrations WHERE masterclassId = ? AND status = ?')) {
    const masterclassId = params[0];
    const status = params[1];
    const count = store.registrations.filter(r => r.masterclassId === masterclassId && r.status === status).length;
    return [{ count }];
  }

  // SELECT COUNT(*) as count FROM registrations WHERE 1=1 (with optional filters)
  if (sql.includes('SELECT COUNT(*) as count FROM registrations WHERE 1=1')) {
    let results = store.registrations;

    if (sql.includes('masterclassId = ?')) {
      const masterclassId = params[0];
      results = results.filter(r => r.masterclassId === masterclassId);
    }

    if (sql.includes('status = ?')) {
      const statusIndex = sql.includes('masterclassId = ?') ? 1 : 0;
      const status = params[statusIndex];
      results = results.filter(r => r.status === status);
    }

    return [{ count: results.length }];
  }

  // SELECT COUNT(*) as count FROM waitlists WHERE 1=1 (with optional filters)
  if (sql.includes('SELECT COUNT(*) as count FROM waitlists WHERE 1=1')) {
    let results = store.waitlists;

    if (sql.includes('masterclassId = ?')) {
      const masterclassId = params[0];
      results = results.filter(w => w.masterclassId === masterclassId);
    }

    return [{ count: results.length }];
  }

  // SELECT COUNT(*) as count FROM waitlists
  if (sql.includes('SELECT COUNT(*) as count FROM waitlists') && !sql.includes('WHERE')) {
    return [{ count: store.waitlists.length }];
  }

  // SELECT r.*, m.title as masterclass_title FROM registrations r LEFT JOIN masterclasses m ON r.masterclassId = m.id WHERE 1=1
  if (sql.includes('SELECT r.*, m.title as masterclass_title FROM registrations r LEFT JOIN masterclasses m ON r.masterclassId = m.id WHERE 1=1')) {
    let results = store.registrations.map(r => {
      const mc = store.masterclasses.find(m => m.id === r.masterclassId);
      return {
        ...r,
        masterclass_title: mc ? mc.title : 'N/A'
      };
    });

    // Handle filtering and pagination for getAllRegistrations
    if (sql.includes('AND r.masterclassId = ?')) {
      const masterclassId = params[0];
      results = results.filter(r => r.masterclassId === masterclassId);
    }

    if (sql.includes('AND r.status = ?')) {
      const statusIndex = sql.includes('AND r.masterclassId = ?') ? 1 : 0;
      const status = params[statusIndex];
      results = results.filter(r => r.status === status);
    }

    // Handle ORDER BY and LIMIT for pagination
    if (sql.includes('ORDER BY r.createdAt DESC')) {
      results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sql.includes('LIMIT ? OFFSET ?')) {
      const limitIndex = params.length - 2;
      const offsetIndex = params.length - 1;
      const limit = params[limitIndex];
      const offset = params[offsetIndex];
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  // SELECT w.*, m.title as masterclass_title FROM waitlists w LEFT JOIN masterclasses m ON w.masterclassId = m.id WHERE 1=1
  if (sql.includes('SELECT w.*, m.title as masterclass_title FROM waitlists w LEFT JOIN masterclasses m ON w.masterclassId = m.id WHERE 1=1')) {
    let results = store.waitlists.map(w => {
      const mc = store.masterclasses.find(m => m.id === w.masterclassId);
      return {
        ...w,
        masterclass_title: mc ? mc.title : 'N/A'
      };
    });

    // Handle filtering and pagination for getAllWaitlist
    if (sql.includes('AND w.masterclassId = ?')) {
      const masterclassId = params[0];
      results = results.filter(w => w.masterclassId === masterclassId);
    }

    // Handle ORDER BY and LIMIT for pagination
    if (sql.includes('ORDER BY w.position ASC')) {
      results = results.sort((a, b) => a.position - b.position);
    }

    if (sql.includes('LIMIT ? OFFSET ?')) {
      const limitIndex = params.length - 2;
      const offsetIndex = params.length - 1;
      const limit = params[limitIndex];
      const offset = params[offsetIndex];
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  // SELECT r.*, m.title as masterclass_title FROM registrations r LEFT JOIN masterclasses m ON r.masterclassId = m.id WHERE r.status = ?
  if (sql.includes('SELECT r.*, m.title as masterclass_title FROM registrations r LEFT JOIN masterclasses m ON r.masterclassId = m.id WHERE r.status = ?')) {
    const status = params[0];
    return store.registrations.filter(r => r.status === status).map(r => {
      const mc = store.masterclasses.find(m => m.id === r.masterclassId);
      return {
        ...r,
        masterclass_title: mc ? mc.title : 'N/A'
      };
    });
  }

  // UPDATE registrations SET status = ? WHERE id = ?
  if (sql.includes('UPDATE registrations SET status = ? WHERE id = ?')) {
    const status = params[0];
    const id = params[1];
    const reg = store.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = status;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // UPDATE masterclasses SET bookedCount = GREATEST(0, bookedCount - 1) WHERE id = ?
  if (sql.includes('UPDATE masterclasses SET bookedCount = GREATEST(0, bookedCount - 1) WHERE id = ?')) {
    const id = params[0];
    const mc = store.masterclasses.find(m => m.id === id);
    if (mc) {
      mc.bookedCount = Math.max(0, mc.bookedCount - 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // SELECT * FROM waitlists WHERE masterclassId = ? ORDER BY position ASC LIMIT 1
  if (sql.includes('SELECT * FROM waitlists WHERE masterclassId = ? ORDER BY position ASC LIMIT 1')) {
    const masterclassId = params[0];
    const waitlists = store.waitlists.filter(w => w.masterclassId === masterclassId).sort((a, b) => a.position - b.position);
    return waitlists.slice(0, 1);
  }

  // UPDATE masterclasses SET bookedCount = bookedCount + 1 WHERE id = ?
  if (sql.includes('UPDATE masterclasses SET bookedCount = bookedCount + 1 WHERE id = ?')) {
    const id = params[0];
    const mc = store.masterclasses.find(m => m.id === id);
    if (mc) {
      mc.bookedCount += 1;
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // DELETE FROM waitlists WHERE id = ?
  if (sql.includes('DELETE FROM waitlists WHERE id = ?')) {
    const id = params[0];
    const index = store.waitlists.findIndex(w => w.id === id);
    if (index > -1) {
      store.waitlists.splice(index, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // UPDATE waitlists SET position = position - 1 WHERE masterclassId = ? AND position > ?
  if (sql.includes('UPDATE waitlists SET position = position - 1 WHERE masterclassId = ? AND position > ?')) {
    const masterclassId = params[0];
    const position = params[1];
    store.waitlists.filter(w => w.masterclassId === masterclassId && w.position > position).forEach(w => w.position -= 1);
    return { affectedRows: 1 };
  }

  // SELECT * FROM waitlists WHERE id = ?
  if (sql.includes('SELECT * FROM waitlists WHERE id = ?')) {
    const id = params[0];
    return store.waitlists.filter(w => w.id === id);
  }

  // INSERT INTO waitlists
  if (sql.includes('INSERT INTO waitlists')) {
    const waitlistId = store.waitlists.length > 0 ? Math.max(...store.waitlists.map(w => w.id)) + 1 : 1;
    const newWaitlist = {
      id: waitlistId,
      masterclassId: params[0],
      name: params[1],
      email: params[2],
      position: params[3],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.waitlists.push(newWaitlist);
    return [{ insertId: waitlistId, affectedRows: 1 }];
  }

  // SELECT ... FROM registrations ... GROUP BY
  if (sql.includes('GROUP BY status')) {
    const confirmed = store.registrations.filter(r => r.status === 'CONFIRMED').length;
    const waitlisted = store.registrations.filter(r => r.status === 'WAITLISTED').length;
    const cancelled = store.registrations.filter(r => r.status === 'CANCELLED').length;
    return [
      { status: 'CONFIRMED', count: confirmed },
      { status: 'WAITLISTED', count: waitlisted },
      { status: 'CANCELLED', count: cancelled },
    ];
  }

  console.log('[MOCK DB] No matching handler - returning empty array');
  return [];
}

/**
 * Test connection
 */
async function testConnection() {
  console.log('[MOCK DB] ✅ Mock database initialized (in-memory, no MySQL needed)');
  return true;
}

module.exports = {
  query,
  testConnection,
  store, // For debugging
};
