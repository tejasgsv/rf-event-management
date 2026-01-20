<?php
/**
 * Response Helper
 * Standardized JSON response formatting
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Send success response
 */
function response_success($data = [], $message = 'Success', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Send error response
 */
function response_error($message = 'Error', $code = 400, $data = []) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Validate request method
 */
function require_method($method) {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        response_error('Method not allowed', 405);
    }
}

/**
 * Get JSON body
 */
function get_json_body() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    return $data ?? [];
}

/**
 * Sanitize string input
 */
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Get database connection
 */
function get_db() {
    global $pdo;
    return $pdo;
}
