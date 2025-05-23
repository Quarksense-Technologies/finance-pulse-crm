
const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Admin only
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be one of: admin, manager, user').isIn(['admin', 'manager', 'user'])
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        success: false 
      });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          message: 'User already exists',
          success: false
        });
      }

      // Create new user (password will be hashed by pre-save hook)
      user = new User({
        name,
        email,
        password,
        role
      });

      await user.save();

      // Generate token
      const token = generateToken(user.id);

      // Return response without password
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        success: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        message: 'Server error during registration',
        success: false
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        success: false 
      });
    }

    const { email, password } = req.body;

    try {
      // Find user with password (password is not included by default due to select: false)
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          message: 'Invalid credentials',
          success: false
        });
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          message: 'Invalid credentials',
          success: false
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Return response without password
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        success: true
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Server error during login',
        success: false
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = req.user;

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      theme: user.theme,
      createdAt: user.createdAt,
      success: true
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Server error getting current user',
      success: false
    });
  }
});

module.exports = router;
