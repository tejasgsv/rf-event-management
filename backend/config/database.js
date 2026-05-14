const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rf_event_management',
  port: process.env.DB_PORT || 3306, // ✅ FIX: correct default port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+05:30'
});

// Test connection with retry logic
async function testConnection(maxRetries = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connection successful');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error.message}`);
      }
      
      console.log(`⏳ Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// ✅ STANDARD QUERY (returns [rows, fields])
async function query(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

// Get one record
async function getOne(sql, params = []) {
  const [rows] = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Get all records
async function getAll(sql, params = []) {
  const [rows] = await query(sql, params);
  return rows;
}

// Insert record
async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const [result] = await query(sql, values);
  return result;
}

// Update record
async function update(table, data, where) {
  const setParts = Object.keys(data).map(key => `${key} = ?`);
  const whereParts = Object.keys(where).map(key => `${key} = ?`);
  const sql = `UPDATE ${table} SET ${setParts.join(', ')} WHERE ${whereParts.join(' AND ')}`;
  const values = [...Object.values(data), ...Object.values(where)];
  const [result] = await query(sql, values);
  return result;
}

// Remove record
async function remove(table, where) {
  const whereParts = Object.keys(where).map(key => `${key} = ?`);
  const sql = `DELETE FROM ${table} WHERE ${whereParts.join(' AND ')}`;
  const values = Object.values(where);
  const [result] = await query(sql, values);
  return result;
}

// Get connection (for transactions)
async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  insert,
  update,
  remove,
  getConnection,
  testConnection
};
