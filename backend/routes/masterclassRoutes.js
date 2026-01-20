const express = require("express");
const router = express.Router();
const masterclassController = require("../controllers/masterclassController");

/**
 * PUBLIC SESSION ROUTES
 */

// Public agenda (LIVE sessions)
router.get(
  "/sessions/event/:eventId",
  masterclassController.getPublicByEvent
);

// Public session detail
router.get(
  "/sessions/:id",
  masterclassController.getPublicById
);

// ✅ LIGHTWEIGHT STATUS ENDPOINT (for real-time polling)
router.get(
  "/sessions/:id/status",
  masterclassController.getSessionStatus
);

module.exports = router;
