<?php
/**
 * Agenda API
 * GET /api/agenda - Get agenda/sessions for current event
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
    
    // Get agenda items with speaker info
    $agenda = db_fetch_all(
        "SELECT a.id, a.title, a.description, a.start_time, a.end_time, 
                a.location, a.coordinator_name, a.status,
                s.name as speaker_name, s.title as speaker_title, s.company as speaker_company
         FROM agenda a
         LEFT JOIN speakers s ON a.speaker_id = s.id
         WHERE a.event_id = ?
         ORDER BY a.start_time ASC",
        [$event_id]
    );
    
    // Format times and dates
    foreach ($agenda as &$item) {
        $item['date'] = date('M d', strtotime($item['start_time']));
        $item['start_time'] = date('H:i', strtotime($item['start_time']));
        $item['end_time'] = date('H:i', strtotime($item['end_time']));
    }
    
    if (empty($agenda)) {
        response_success([], 'No agenda available yet');
    }
    
    response_success($agenda, 'Agenda retrieved successfully');
    
} catch (Exception $e) {
    error_log("Agenda API error: " . $e->getMessage());
    response_error('Failed to retrieve agenda', 500);
}
