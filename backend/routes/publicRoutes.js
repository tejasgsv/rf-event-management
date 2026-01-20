const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const adminMasterclassController = require("../controllers/adminMasterclassController");
const userRegistrationController = require("../controllers/userRegistrationController");

/**
 * ============================================
 * 🌐 PUBLIC ROUTES (NO AUTH REQUIRED)
 * Used by FRONTEND (User App)
 * ============================================
 */

/**
 * 🔹 GET /events
 * ✔ List ONLY ACTIVE events
 * ✔ Used by EventHome.jsx
 */
router.get("/events", eventController.getAllEvents);

/**
 * 🔹 GET /events/:id
 * ✔ Single event detail
 */
router.get("/events/:id", eventController.getEventById);

/**
 * 🔹 GET /sessions/event/:eventId
 * ✔ Agenda page
 * ✔ Only LIVE sessions
 * ✔ Includes booked_count
 * ✔ Used by AgendaList.jsx
 */
router.get(
  "/sessions/event/:eventId",
  adminMasterclassController.getPublicByEvent
);

/**
 * 🔹 GET /sessions/:sessionId
 * ✔ Masterclass detail page
 * ✔ Used by MasterclassDetail.jsx
 */
router.get(
  "/sessions/:sessionId",
  adminMasterclassController.getPublicSingle
);

/**
 * 🔹 POST /registrations
 * ✔ Register / Waitlist
 * ✔ Atomic booking
 * ✔ QR generated
 * ✔ Used by RegistrationForm.jsx
 */
router.post(
  "/registrations",
  userRegistrationController.registerForEvent
);

/**
 * 🔹 GET /registrations/user/:email
 * ✔ My Schedule
 */
router.get(
  "/registrations/user/:email",
  userRegistrationController.getUserRegistrations
);

/**
 * 🔹 GET /registrations/:registrationId
 * ✔ QR screen
 */
router.get(
  "/registrations/:registrationId",
  userRegistrationController.getRegistration
);

/**
 * 🔹 POST /registrations/:registrationId/cancel
 * ✔ Cancel registration
 * ✔ Frees seat
 * ✔ Auto-promotes waitlist
 */
router.post(
  "/registrations/:registrationId/cancel",
  userRegistrationController.cancelRegistration
);

module.exports = router;
