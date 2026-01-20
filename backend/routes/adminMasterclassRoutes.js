const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminMasterclassController");
const authAdmin = require("../middleware/authAdmin");

// 🔐 Protect all admin routes
router.use(authAdmin);

/**
 * ============================================
 * 🔐 ADMIN SESSION / MASTERCLASS ROUTES
 * ============================================
 */

// ✅ Create session (DRAFT)
router.post(
  "/sessions",
  controller.createMasterclass
);

// ✅ Get sessions by event (Admin)
router.get(
  "/sessions/event/:eventId",
  controller.getByEvent
);

// ✅ Get sessions by event (Admin) - query param
router.get(
  "/sessions",
  controller.getByEvent
);

// ✅ Get single session
router.get(
  "/sessions/:id",
  controller.getMasterclass
);

// ✅ Update session
router.put(
  "/sessions/:id",
  controller.updateMasterclass
);

// ✅ Delete session
router.delete(
  "/sessions/:id",
  controller.deleteMasterclass
);

module.exports = router;
