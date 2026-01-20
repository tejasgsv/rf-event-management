const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminRegistrationController");
const authAdmin = require("../middleware/authAdmin");

// 🔐 Protect ALL admin registration routes
router.use(authAdmin);

/* ===========================
   REGISTRATIONS (ADMIN)
=========================== */

// Cancel registration with ghost-seat promotion
router.post("/registrations/:registrationId/cancel", controller.cancelRegistration);

// List registrations by event
router.get("/registrations/event/:eventId", controller.getRegistrationsByEvent);

// Force promote a waitlist entry (admin override)
router.post("/waitlist/:waitlistId/promote", controller.forcePromoteWaitlist);

// Waitlist listing
router.get("/waitlist", controller.getAllWaitlist);

// Remove waitlist entry
router.delete("/waitlist/:waitlistId", controller.deleteWaitlistEntry);

// Seat availability for a masterclass
router.get("/masterclasses/:masterclassId/seat-status", controller.getMasterclassSeatStatus);

module.exports = router;
