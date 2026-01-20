const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const scannerController = require("../controllers/adminScannerController");

// 🔐 ADMIN ONLY
router.use(authAdmin);

// 📷 Scan QR
router.post("/scan", scannerController.scanQR);

module.exports = router;
