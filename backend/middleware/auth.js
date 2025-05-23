
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided or invalid format.',
        success: false
      });
    }

    // Extract token without "Bearer " prefix
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        success: false
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          message: 'Invalid token: User not found',
          success: false
        });
      }

      // Add user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({
        message: 'Invalid token',
        success: false
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Internal server error in auth middleware',
      success: false
    });
  }
};
