const jwt = require('jsonwebtoken');

// 🔐 Admin Authentication Middleware
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. Token missing.'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not set');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ALLOW MULTIPLE ADMIN ROLES
    const allowedRoles = ['superadmin', 'admin', 'moderator'];

    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin access only.'
      });
    }

    // Attach admin context
    req.admin = {
      adminId: decoded.adminId,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin session expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed admin token.'
    });
  }
};
