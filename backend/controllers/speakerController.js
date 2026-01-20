const db = require('../config/database');
const { catchAsync } = require('../utils/errorHandler');

// ===========================
// SPEAKER CONTROLLER
// ===========================

// Get all speakers
exports.getAll = catchAsync(async (req, res) => {
  const [speakers] = await db.query(
    `SELECT 
       id,
       name,
       designation,
       organization,
       bio,
       photo
     FROM speakers
     ORDER BY name ASC`
  );

  res.json({
    success: true,
    data: speakers || []
  });
});

/**
 * Get batch of speakers by IDs (for caching on frontend)
 * POST /api/speakers/batch
 * Body: { speakerIds: [1, 2, 3] }
 */
exports.getBatch = catchAsync(async (req, res) => {
  const { speakerIds = [] } = req.body;

  if (!Array.isArray(speakerIds) || speakerIds.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  // Use parameterized query to prevent SQL injection
  const placeholders = speakerIds.map(() => '?').join(',');
  const [speakers] = await db.query(
    `SELECT 
       id,
       name,
       designation as title,
       organization,
       bio,
       photo as headshot,
       linkedin_url as linkedIn,
       twitter_url as twitter
     FROM speakers
     WHERE id IN (${placeholders})`,
    speakerIds
  );

  res.json({
    success: true,
    data: speakers || []
  });
});

