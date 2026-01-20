const db = require('../config/database');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { catchAsync } = require('../utils/errorHandler');

// ===========================
// ADMIN AUTHENTICATION
// ===========================

// Admin Login
exports.adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not configured');
    return res.status(500).json({
      success: false,
      message: 'Server misconfiguration'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // ✅ FIX 1: mysql2 promise structure
  const [admins] = await db.query(
    'SELECT * FROM admins WHERE email = ?',
    [cleanEmail]
  );

  if (!admins || admins.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const admin = admins[0];

  // ✅ SHA256 password check (as per requirement)
  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  if (hashedPassword !== admin.password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // ✅ FIX 2: correct column name (admin_id)
  const token = jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role || 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin'
    }
  });
});
