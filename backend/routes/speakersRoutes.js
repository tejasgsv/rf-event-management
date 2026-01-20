const express = require('express');
const router = express.Router();
const speakerController = require('../controllers/speakerController');

// ===========================
// PUBLIC SPEAKERS ROUTES
// ===========================

// 🔓 Get all speakers
// GET /api/speakers
router.get('/speakers', speakerController.getAll);

// 🔓 Get batch of speakers by IDs (for frontend caching)
// POST /api/speakers/batch
router.post('/speakers/batch', speakerController.getBatch);

module.exports = router;
