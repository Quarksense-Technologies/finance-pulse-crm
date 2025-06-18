
const express = require('express');
const { check, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const ProjectResource = require('../models/ProjectResource');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Private (any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find({ isActive: true })
      .sort({ name: 1 });
    
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      message: 'Server error fetching resources',
      success: false
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Private (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found',
        success: false
      });
    }
    
    res.status(200).json(resource);
  } catch (error) {
    console.error(`Error fetching resource ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching resource',
      success: false
    });
  }
});

// @route   POST /api/resources
// @desc    Create new resource
// @access  Admin or Manager
router.post(
  '/',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('role', 'Role is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('hourlyRate', 'Hourly rate must be a number').optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        success: false 
      });
    }

    try {
      const { name, role, email, phone, hourlyRate, skills, department } = req.body;

      // Check if resource with email already exists
      const existingResource = await Resource.findOne({ email });
      if (existingResource) {
        return res.status(400).json({
          message: 'Resource with this email already exists',
          success: false
        });
      }

      const resource = new Resource({
        name,
        role,
        email,
        phone,
        hourlyRate: hourlyRate || 0,
        skills: skills || [],
        department
      });

      await resource.save();
      
      res.status(201).json(resource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({
        message: 'Server error creating resource',
        success: false
      });
    }
  }
);

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Admin or Manager
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      let resource = await Resource.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found',
          success: false
        });
      }
      
      const updateData = {};
      const { name, role, email, phone, hourlyRate, skills, department, isActive } = req.body;
      
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
      if (skills) updateData.skills = skills;
      if (department) updateData.department = department;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      resource = await Resource.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      
      res.status(200).json(resource);
    } catch (error) {
      console.error(`Error updating resource ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating resource',
        success: false
      });
    }
  }
);

// @route   DELETE /api/resources/:id
// @desc    Delete resource (soft delete)
// @access  Admin
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found',
        success: false
      });
    }
    
    // Soft delete - mark as inactive
    await Resource.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Also deactivate all project allocations
    await ProjectResource.updateMany(
      { resourceId: req.params.id },
      { isActive: false }
    );
    
    res.status(200).json({
      message: 'Resource deactivated successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting resource ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting resource',
      success: false
    });
  }
});

// PROJECT RESOURCE ALLOCATION ROUTES

// @route   GET /api/resources/project/:projectId
// @desc    Get allocated resources for a project
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const allocations = await ProjectResource.find({ 
      projectId: req.params.projectId,
      isActive: true 
    })
    .populate('resourceId')
    .populate('projectId', 'name')
    .sort({ startDate: -1 });
    
    res.status(200).json(allocations);
  } catch (error) {
    console.error(`Error fetching project resources for ${req.params.projectId}:`, error);
    res.status(500).json({
      message: 'Server error fetching project resources',
      success: false
    });
  }
});

// @route   POST /api/resources/project/:projectId/allocate
// @desc    Allocate resource to project
// @access  Admin or Manager
router.post(
  '/project/:projectId/allocate',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('resourceId', 'Resource ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601().toDate(),
    check('hoursAllocated', 'Hours allocated must be a number').optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg,
        success: false 
      });
    }

    try {
      const { projectId } = req.params;
      const { resourceId, hoursAllocated, startDate, endDate } = req.body;

      // Verify project and resource exist
      const project = await Project.findById(projectId);
      const resource = await Resource.findById(resourceId);

      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }

      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found',
          success: false
        });
      }

      // Check if resource is already allocated to this project
      const existingAllocation = await ProjectResource.findOne({
        projectId,
        resourceId,
        isActive: true
      });

      if (existingAllocation) {
        return res.status(400).json({
          message: 'Resource is already allocated to this project',
          success: false
        });
      }

      const allocation = new ProjectResource({
        projectId,
        resourceId,
        hoursAllocated: hoursAllocated || 0,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      });

      await allocation.save();

      // Populate the response
      await allocation.populate('resourceId');
      await allocation.populate('projectId', 'name');
      
      res.status(201).json(allocation);
    } catch (error) {
      console.error('Error allocating resource to project:', error);
      res.status(500).json({
        message: 'Server error allocating resource',
        success: false
      });
    }
  }
);

// @route   PUT /api/resources/project-allocation/:id
// @desc    Update project resource allocation
// @access  Admin or Manager
router.put(
  '/project-allocation/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      let allocation = await ProjectResource.findById(req.params.id);
      
      if (!allocation) {
        return res.status(404).json({
          message: 'Resource allocation not found',
          success: false
        });
      }
      
      const updateData = {};
      const { hoursAllocated, startDate, endDate, isActive } = req.body;
      
      if (hoursAllocated !== undefined) updateData.hoursAllocated = hoursAllocated;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      allocation = await ProjectResource.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).populate('resourceId').populate('projectId', 'name');
      
      res.status(200).json(allocation);
    } catch (error) {
      console.error(`Error updating resource allocation ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating resource allocation',
        success: false
      });
    }
  }
);

// @route   DELETE /api/resources/project-allocation/:id
// @desc    Remove resource allocation from project
// @access  Admin or Manager
router.delete('/project-allocation/:id', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const allocation = await ProjectResource.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({
        message: 'Resource allocation not found',
        success: false
      });
    }
    
    await ProjectResource.findByIdAndUpdate(req.params.id, { isActive: false });
    
    res.status(200).json({
      message: 'Resource allocation removed successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error removing resource allocation ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error removing resource allocation',
      success: false
    });
  }
});

module.exports = router;
