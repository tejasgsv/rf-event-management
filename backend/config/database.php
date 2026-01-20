<?php
/**
 * Database Configuration
 * MySQL connection handler
 */

// Load environment variables from .env
$env_file = __DIR__ . '/../.env';
if (file_exists($env_file)) {
    $env = parse_ini_file($env_file);
} else {
    $env = [];
}

// Database configuration
define('DB_HOST', $env['DB_HOST'] ?? 'localhost');
define('DB_USER', $env['DB_USER'] ?? 'root');
define('DB_PASS', $env['DB_PASS'] ?? '');
define('DB_NAME', $env['DB_NAME'] ?? 'rf_event_management');
define('DB_PORT', $env['DB_PORT'] ?? 3306);

// Connection settings
$charset = 'utf8mb4';

// Create connection string
$dsn = "mysql:host=" . DB_HOST . ":" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . $charset;

try {
    // Create PDO connection
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // Log successful connection (remove in production)
    // error_log("Database connected successfully to " . DB_NAME);
    
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]));
}

/**
 * Query helper function
 */
function db_query($sql, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log("Query error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Get single row
 */
function db_fetch_one($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->fetch();
}

/**
 * Get multiple rows
 */
function db_fetch_all($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->fetchAll();
}

/**
 * Insert record and return last insert ID
 */
function db_insert($sql, $params = []) {
    global $pdo;
    $stmt = db_query($sql, $params);
    return $pdo->lastInsertId();
}

/**
 * Update record and return affected rows
 */
function db_update($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->rowCount();
}

/**
 * Delete record and return affected rows
 */
function db_delete($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->rowCount();
}
