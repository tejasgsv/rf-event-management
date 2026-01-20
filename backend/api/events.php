<?php
/**
 * Events API
 * GET /api/event - Get current event details
 */

require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../utils/response.php');

require_method('GET');

try {
    // Get the latest event
    $event = db_fetch_one(
        "SELECT id, name, description, start_date, end_date, venue, venue_address, 
                contact_email, emergency_contact, emergency_phone, about_text, 
                logo_url, banner_url, created_at, updated_at 
         FROM events 
         ORDER BY created_at DESC 
         LIMIT 1"
    );
    
    if (!$event) {
        response_error('No event found', 404);
    }
    
    // Format dates
    $event['start_date'] = date('M d, Y', strtotime($event['start_date']));
    $event['end_date'] = date('M d, Y', strtotime($event['end_date']));
    
    response_success($event, 'Event retrieved successfully');
    
} catch (Exception $e) {
    error_log("Events API error: " . $e->getMessage());
    response_error('Failed to retrieve event', 500);
}
