const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

/**
 * ============================================
 * 🌐 PUBLIC EVENT ROUTES
 * Used by FRONTEND (User App)
 * ============================================
 */

/**
 * GET /api/events
 * ✔ Return ONLY ACTIVE events
 * ✔ Used by EventHome.jsx
 */
router.get("/events", eventController.getAllActiveEvents);

/**
 * GET /api/events/:id
 * ✔ Single event detail
 */
router.get("/events/:id", eventController.getEventById);

module.exports = router;
