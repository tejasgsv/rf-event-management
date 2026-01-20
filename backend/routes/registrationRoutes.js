const express = require("express");
const router = express.Router();

const registrationController = require("../controllers/userRegistrationController");
const cancellationController = require("../controllers/registrationCancellationController");

/**
 * ============================================
 * 🌐 PUBLIC REGISTRATION ROUTES
 * ============================================
 */

// ✅ Register / Waitlist
router.post(
  "/registrations",
  registrationController.registerForEvent
);

// ✅ Single registration (QR screen)
router.get(
  "/registrations/:registrationId",
  registrationController.getRegistration
);

// ✅ Cancel registration
router.post(
  "/registrations/:registrationId/cancel",
  cancellationController.cancelRegistration
);

module.exports = router;
