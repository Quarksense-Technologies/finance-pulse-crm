
const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Admin only
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Server error fetching users',
      success: false
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Authenticated users
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }
    
    // Only allow users to view their own profile or admin to view any profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        message: 'Forbidden: You can only view your own profile',
        success: false
      });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching user',
      success: false
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Admin only
router.post(
  '/',
  auth,
  roleCheck(['admin']),
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

    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists',
          success: false
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        managerId: req.body.managerId || null
      });

      await user.save();

      // Return response without password
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        createdAt: user.createdAt,
        success: true
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        message: 'Server error creating user',
        success: false
      });
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin only
router.put(
  '/:id',
  auth,
  roleCheck(['admin']),
  async (req, res) => {
    try {
      const { name, email, role, managerId } = req.body;
      const updateData = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (managerId) updateData.managerId = managerId;
      
      // If password is provided, update it
      if (req.body.password) {
        // Create a new User instance to use the password hashing middleware
        const tempUser = new User({ password: req.body.password });
        await tempUser.save();
        updateData.password = tempUser.password;
        await User.findByIdAndDelete(tempUser._id); // Clean up temp user
      }
      
      // Find user and update
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          success: false
        });
      }
      
      // Update user
      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      res.status(200).json(user);
    } catch (error) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating user',
        success: false
      });
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Check if trying to delete self
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
        success: false
      });
    }
    
    // Find user to delete
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'User deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting user',
      success: false
    });
  }
});

// @route   PUT /api/users/profile/update
// @desc    Update current user's profile
// @access  Private (any authenticated user)
router.put(
  '/profile/update',
  auth,
  async (req, res) => {
    try {
      const { name, theme, profileImage } = req.body;
      const updateData = {};
      
      if (name) updateData.name = name;
      if (theme) updateData.theme = theme;
      if (profileImage) updateData.profileImage = profileImage;
      
      // Update user profile
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      res.status(200).json(user);
    } catch (error) {
      console.error(`Error updating profile for user ${req.user.id}:`, error);
      res.status(500).json({
        message: 'Server error updating profile',
        success: false
      });
    }
  }
);

module.exports = router;
