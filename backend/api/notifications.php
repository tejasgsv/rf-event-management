<?php
/**
 * Notifications API
 * GET /api/notifications - Get visible notifications
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
    
    // Get visible notifications
    $notifications = db_fetch_all(
        "SELECT id, title, message, type, created_at
         FROM notifications
         WHERE event_id = ? AND visible = TRUE
         ORDER BY created_at DESC",
        [$event_id]
    );
    
    if (empty($notifications)) {
        response_success([], 'No notifications');
    }
    
    // Format times
    foreach ($notifications as &$notif) {
        $notif['created_at'] = date('M d H:i', strtotime($notif['created_at']));
    }
    
    response_success($notifications, 'Notifications retrieved successfully');
    
} catch (Exception $e) {
    error_log("Notifications API error: " . $e->getMessage());
    response_error('Failed to retrieve notifications', 500);
}
