const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminDashboardController");

// GET /api/admin/dashboard
router.get("/dashboard", controller.getDashboard);

module.exports = router;
