const express = require('express');
const router = express.Router();

const controller = require('../controllers/adminEventController');
const adminDashboardController = require('../controllers/adminDashboardController');
const authAdmin = require('../middleware/authAdmin');

// 🔐 Protect ALL admin routes
router.use(authAdmin);

// =========================
// 📊 ADMIN DASHBOARD
// =========================

// Dashboard overview (stats + active event)
router.get('/dashboard', adminDashboardController.getDashboard);

// =========================
// 🎪 EVENT MANAGEMENT
// =========================

// Create new event (DRAFT)
router.post('/events', controller.createEvent);

// Get all events (Admin view)
router.get('/events', controller.getAllEvents);

// Get single event (IMPORTANT for ManageEvent)
router.get('/events/:id', controller.getEventById);

// Update event (DRAFT / ACTIVE only)
router.put('/events/:id', controller.updateEvent);

// Archive event (safe delete)
router.post('/events/:id/archive', controller.archiveEvent);

// Permanently delete event (only if no registrations)
router.delete('/events/:id', controller.deleteEvent);

module.exports = router;
