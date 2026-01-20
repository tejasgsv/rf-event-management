const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ===========================
// ADMIN AUTH ROUTES
// ===========================

// 🔓 Public Admin Login
// POST /api/admin/login
router.post('/login', adminController.adminLogin);

module.exports = router;
