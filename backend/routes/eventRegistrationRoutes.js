const express = require('express');
const router = express.Router();
const eventRegistrationController = require('../controllers/userRegistrationController');
const auth = require('../middleware/auth');

/**
 * REGISTRATION FLOW ROUTES
 * 
 * Public routes:
 * POST /api/register - Submit registration form and get QR code
 * GET /api/register/details/:registrationId - Get registration details
 * GET /api/register/user/:email - Get user's registrations
 * DELETE /api/register/cancel/:registrationId - Cancel registration
 * 
 * Admin routes:
 * POST /api/register/verify - Verify QR code for check-in
 */

// Public Routes

/**
 * POST /api/register
 * Submit complete registration form
 * 
 * Body:
 * {
 *   eventId: string,
 *   masterclassId: string,
 *   name: string,
 *   surname: string,
 *   email: string,
 *   mobile: string,
 *   company?: string,
 *   jobTitle?: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   registration: {
 *     registrationId,
 *     email,
 *     qrCode (base64 PNG image),
 *     status: 'CONFIRMED'
 *   },
 *   message: 'Registration successful! Your QR code is ready.'
 * }
 */
router.post('/', eventRegistrationController.registerForEvent);

/**
 * GET /api/register/details/:registrationId
 * Retrieve registration details by registration ID
 */
router.get('/details/:registrationId', eventRegistrationController.getRegistrationDetails);

/**
 * GET /api/register/user/:email
 * Get all registrations for a specific email
 * Returns confirmed registrations with QR codes
 */
router.get('/user/:email', eventRegistrationController.getUserRegistrations);

/**
 * DELETE /api/register/cancel/:registrationId
 * Cancel a registration (invalidates QR code)
 * 
 * Body:
 * {
 *   email: string (for verification)
 * }
 */
router.delete('/cancel/:registrationId', eventRegistrationController.cancelRegistration);

// Admin Routes

/**
 * POST /api/register/verify
 * Verify QR code and check in attendee (Admin only)
 * 
 * Body:
 * {
 *   qrToken: string,
 *   qrData: string,
 *   email: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   registration: {
 *     registrationId,
 *     name,
 *     email,
 *     eventName,
 *     sessionName,
 *     checkedInAt
 *   }
 * }
 */
router.post('/verify', auth, eventRegistrationController.verifyQRCode);

module.exports = router;
