<?php
/**
 * Speakers API
 * GET /api/speakers - Get all speakers for current event
 */

require_once(__DIR__ . '/../config/database.php');
require_once(__DIR__ . '/../utils/response.php');

require_method('GET');

try {
    // Get current event
    $event = db_fetch_one(
        "SELECT id FROM events ORDER BY created_at DESC LIMIT 1"
    );
    
    if (!$event) {
        response_error('No event found', 404);
    }
    
    $event_id = $event['id'];
    
    // Get all speakers
    $speakers = db_fetch_all(
        "SELECT id, name, bio, photo_url, title, company, email, social_links
         FROM speakers
         WHERE event_id = ?
         ORDER BY name ASC",
        [$event_id]
    );
    
    if (empty($speakers)) {
        response_success([], 'No speakers available yet');
    }
    
    // Parse social links JSON
    foreach ($speakers as &$speaker) {
        if ($speaker['social_links']) {
            $speaker['social_links'] = json_decode($speaker['social_links'], true);
        } else {
            $speaker['social_links'] = [];
        }
    }
    
    response_success($speakers, 'Speakers retrieved successfully');
    
} catch (Exception $e) {
    error_log("Speakers API error: " . $e->getMessage());
    response_error('Failed to retrieve speakers', 500);
}
