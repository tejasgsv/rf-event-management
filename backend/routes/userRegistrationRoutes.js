const express = require('express');
const router = express.Router();
const userRegController = require('../controllers/userRegistrationController');
const auth = require('../middleware/auth');

/**
 * =============================================
 * USER REGISTRATION ROUTES
 * =============================================
 * 
 * Routes for users to register for sessions
 * and manage their registrations
 */

/**
 * POST /api/sessions/:sessionId/register
 * Register user for a session
 * 
 * Headers: Authorization: Bearer {token}
 * 
 * Body:
 * {
 *   event_id: number
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     registration_id: number,
 *     status: 'confirmed' | 'pending',
 *     is_waitlist: boolean,
 *     waitlist_position: number (optional),
 *     message: string
 *   }
 * }
 */
router.post('/:sessionId/register', async (req, res) => {
  req.body.sessionId = req.params.sessionId;
  return userRegController.registerForEvent(req, res);
});

/**
 * GET /api/events/:eventId/registrations
 * Get user's registrations for an event
 * 
 * Headers: Authorization: Bearer {token}
 */
// Public lookup by email removed per API contract

/**
 * GET /api/users/waitlist
 * Get user's waitlist entries
 * 
 * Headers: Authorization: Bearer {token}
 */
// Optional: waitlist endpoint to list entries by email (not critical now)

/**
 * DELETE /api/registrations/:registrationId
 * Cancel a registration
 * 
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     cancelled: true,
 *     promoted_user_id: number | null,
 *     message: string
 *   }
 * }
 */
// Cancellation handled via admin routes; keep public simple

/**
 * GET /api/sessions/:sessionId/registrations
 * Get session registrations (admin only)
 * 
 * Query: status=confirmed|pending|cancelled (optional)
 */
// Admin-only session registrations are covered in admin routes

/**
 * GET /api/sessions/:sessionId/waitlist
 * Get session waitlist (admin only)
 */
// Admin-only waitlist covered in admin routes

/**
 * GET /api/sessions/:sessionId/info
 * Get session registration info (capacity, registered count, etc)
 */
// Public info endpoint can be added later if needed

/**
 * POST /api/registrations/:registrationId/check-in
 * Check in user for session (admin only)
 * 
 * Headers: Authorization: Bearer {token}
 */
// Check-in handled in admin scanner routes

module.exports = router;
