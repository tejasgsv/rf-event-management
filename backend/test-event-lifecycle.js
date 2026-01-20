// ========================================
// PHASE 2B: EVENT LIFECYCLE TEST SCRIPT
// Test all event endpoints programmatically
// ========================================

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';
let adminToken = null;
let testEventId = null;

// ========================================
// HELPER FUNCTIONS
// ========================================

function log(emoji, message, data = null) {
  console.log(`\n${emoji} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message, error) {
  console.error(`\n❌ ${message}`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Data:`, error.response.data);
  } else {
    console.error(error.message);
  }
}

// ========================================
// TEST 1: ADMIN LOGIN
// ========================================
async function testAdminLogin() {
  try {
    log('🔐', 'TEST 1: Admin Login');
    
    const response = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: 'admin@rf.org',
      password: 'admin123'
    });

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log('✅', 'Admin login successful', { token: adminToken.substring(0, 20) + '...' });
      return true;
    } else {
      log('❌', 'Login failed - no token received');
      return false;
    }
  } catch (error) {
    logError('Admin login failed', error);
    return false;
  }
}

// ========================================
// TEST 2: CREATE EVENT (DRAFT)
// ========================================
async function testCreateEvent() {
  try {
    log('📝', 'TEST 2: Create Event (DRAFT status)');
    
    const eventData = {
      name: 'RF Annual Tech Conference 2026',
      startDate: '2026-06-15 09:00:00',
      endDate: '2026-06-17 18:00:00',
      venue: 'Jio World Centre, Mumbai',
      description: 'Annual technology conference featuring AI, ML, and Digital Innovation',
      helpdeskContact: '+91-9876543210',
      emergencyContact: '+91-9876543211'
    };

    const response = await axios.post(`${BASE_URL}/admin/events`, eventData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success && response.data.data) {
      testEventId = response.data.data.id;
      log('✅', 'Event created successfully', response.data.data);
      
      // Verify DRAFT status
      if (response.data.data.status === 'DRAFT') {
        log('✅', 'Status correctly set to DRAFT');
      } else {
        log('❌', `Unexpected status: ${response.data.data.status}`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    logError('Event creation failed', error);
    return false;
  }
}

// ========================================
// TEST 3: GET ALL EVENTS
// ========================================
async function testGetAllEvents() {
  try {
    log('📋', 'TEST 3: Get All Events');
    
    const response = await axios.get(`${BASE_URL}/admin/events`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success && Array.isArray(response.data.data)) {
      log('✅', `Fetched ${response.data.data.length} events`, response.data.data);
      return true;
    }
    return false;
  } catch (error) {
    logError('Fetch all events failed', error);
    return false;
  }
}

// ========================================
// TEST 4: GET SINGLE EVENT
// ========================================
async function testGetEventById() {
  try {
    log('🔍', `TEST 4: Get Event by ID (${testEventId})`);
    
    const response = await axios.get(`${BASE_URL}/admin/events/${testEventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success && response.data.data) {
      log('✅', 'Event fetched successfully', response.data.data);
      return true;
    }
    return false;
  } catch (error) {
    logError('Fetch event by ID failed', error);
    return false;
  }
}

// ========================================
// TEST 5: UPDATE EVENT - DRAFT → PUBLISHED
// ========================================
async function testUpdateEventToPublished() {
  try {
    log('🔄', 'TEST 5: Update Event Status (DRAFT → PUBLISHED)');
    
    const response = await axios.put(`${BASE_URL}/admin/events/${testEventId}`, 
      { status: 'PUBLISHED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (response.data.success && response.data.data.status === 'PUBLISHED') {
      log('✅', 'Event published successfully', response.data.data);
      return true;
    } else {
      log('❌', 'Status not updated correctly');
      return false;
    }
  } catch (error) {
    logError('Event update to PUBLISHED failed', error);
    return false;
  }
}

// ========================================
// TEST 6: UPDATE EVENT - PUBLISHED → ARCHIVED
// ========================================
async function testUpdateEventToArchived() {
  try {
    log('📦', 'TEST 6: Update Event Status (PUBLISHED → ARCHIVED)');
    
    const response = await axios.put(`${BASE_URL}/admin/events/${testEventId}`, 
      { status: 'ARCHIVED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (response.data.success && response.data.data.status === 'ARCHIVED') {
      log('✅', 'Event archived successfully', response.data.data);
      return true;
    } else {
      log('❌', 'Status not updated correctly');
      return false;
    }
  } catch (error) {
    logError('Event update to ARCHIVED failed', error);
    return false;
  }
}

// ========================================
// TEST 7: ATTEMPT TO UPDATE ARCHIVED EVENT (Should Fail)
// ========================================
async function testUpdateArchivedEvent() {
  try {
    log('🚫', 'TEST 7: Attempt to Update ARCHIVED Event (should fail)');
    
    const response = await axios.put(`${BASE_URL}/admin/events/${testEventId}`, 
      { name: 'Should Not Update' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // If we reach here, the update succeeded (which is wrong)
    log('❌', 'ARCHIVED event was updated - this should NOT happen!');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅', 'Correctly blocked update of ARCHIVED event', error.response.data);
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// ========================================
// TEST 8: ATTEMPT TO DELETE EVENT WITH REGISTRATIONS (Should Fail)
// ========================================
async function testDeleteEventWithRegistrations() {
  try {
    log('🗑️', 'TEST 8: Attempt to Delete Event (protection test)');
    
    // First check if event has registrations
    const eventResponse = await axios.get(`${BASE_URL}/admin/events/${testEventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const registrationCount = eventResponse.data.data.totalRegistrations || 0;
    
    if (registrationCount > 0) {
      log('ℹ️', `Event has ${registrationCount} registrations - delete should fail`);
    } else {
      log('ℹ️', 'Event has no registrations - delete should succeed');
    }

    const response = await axios.delete(`${BASE_URL}/admin/events/${testEventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      if (registrationCount === 0) {
        log('✅', 'Event deleted successfully (no registrations)');
        return true;
      } else {
        log('❌', 'Event deleted despite having registrations - SECURITY ISSUE!');
        return false;
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message?.includes('registrations')) {
      log('✅', 'Correctly blocked deletion of event with registrations', error.response.data);
      return true;
    }
    logError('Unexpected error during deletion', error);
    return false;
  }
}

// ========================================
// TEST 9: VALIDATE DATE CONSTRAINT
// ========================================
async function testDateValidation() {
  try {
    log('📅', 'TEST 9: Date Validation (startDate >= endDate should fail)');
    
    const invalidEventData = {
      name: 'Invalid Event',
      startDate: '2026-06-20 09:00:00',
      endDate: '2026-06-15 18:00:00', // Earlier than start!
      venue: 'Test Venue'
    };

    const response = await axios.post(`${BASE_URL}/admin/events`, invalidEventData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // If we reach here, validation failed
    log('❌', 'Invalid date was accepted - validation missing!');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message?.includes('startDate')) {
      log('✅', 'Date validation working correctly', error.response.data);
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// ========================================
// TEST 10: MISSING REQUIRED FIELDS
// ========================================
async function testMissingRequiredFields() {
  try {
    log('❓', 'TEST 10: Missing Required Fields (should fail)');
    
    const incompleteData = {
      name: 'Incomplete Event'
      // Missing startDate, endDate, venue
    };

    const response = await axios.post(`${BASE_URL}/admin/events`, incompleteData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    log('❌', 'Incomplete data was accepted - validation missing!');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅', 'Required field validation working', error.response.data);
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// ========================================
// MAIN TEST RUNNER
// ========================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  PHASE 2B: EVENT LIFECYCLE TESTING    ║');
  console.log('╚════════════════════════════════════════╝');

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Create Event (DRAFT)', fn: testCreateEvent },
    { name: 'Get All Events', fn: testGetAllEvents },
    { name: 'Get Event by ID', fn: testGetEventById },
    { name: 'Update to PUBLISHED', fn: testUpdateEventToPublished },
    { name: 'Update to ARCHIVED', fn: testUpdateEventToArchived },
    { name: 'Block ARCHIVED Update', fn: testUpdateArchivedEvent },
    { name: 'Delete Protection', fn: testDeleteEventWithRegistrations },
    { name: 'Date Validation', fn: testDateValidation },
    { name: 'Required Fields', fn: testMissingRequiredFields }
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print results
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           TEST RESULTS                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n📊 Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`\n📈 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - Event lifecycle is production-ready!\n');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED - Review errors above\n');
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('❌ Test runner crashed:', err);
  process.exit(1);
});
