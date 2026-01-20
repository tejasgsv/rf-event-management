<?php
/**
 * Resources API
 * GET /api/resources - Get downloadable resources/documents
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
    
    // Get visible resources
    $resources = db_fetch_all(
        "SELECT id, title, file_url, file_type, description, created_at
         FROM resources
         WHERE event_id = ? AND visible = TRUE
         ORDER BY created_at DESC",
        [$event_id]
    );
    
    if (empty($resources)) {
        response_success([], 'No resources available');
    }
    
    response_success($resources, 'Resources retrieved successfully');
    
} catch (Exception $e) {
    error_log("Resources API error: " . $e->getMessage());
    response_error('Failed to retrieve resources', 500);
}
