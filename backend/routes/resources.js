
const express = require('express');
const { check, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Private (any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('projectId', 'name')
      .sort({ startDate: -1 });
    
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
    const resource = await Resource.findById(req.params.id)
      .populate('projectId', 'name');
    
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

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Admin or Manager
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      // Check if resource exists
      let resource = await Resource.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found',
          success: false
        });
      }
      
      // Update resource with only provided fields
      const updateData = {};
      const { 
        name, 
        role, 
        hoursAllocated,
        hourlyRate,
        startDate,
        endDate
      } = req.body;
      
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (hourlyRate) updateData.hourlyRate = hourlyRate;
      if (startDate) updateData.startDate = startDate;
      if (endDate !== undefined) updateData.endDate = endDate;
      
      // Handle change in hours allocated - update project total as well
      if (hoursAllocated !== undefined && hoursAllocated !== resource.hoursAllocated) {
        // Get the project to update manpowerAllocated
        const project = await Project.findById(resource.projectId);
        if (project) {
          let currentManpower = project.manpowerAllocated || 0;
          // Adjust the manpower allocation
          currentManpower = currentManpower - resource.hoursAllocated + hoursAllocated;
          
          await Project.findByIdAndUpdate(
            resource.projectId,
            { $set: { manpowerAllocated: currentManpower } }
          );
        }
        
        updateData.hoursAllocated = hoursAllocated;
      }
      
      // Update resource
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
// @desc    Delete resource
// @access  Admin or Manager
router.delete('/:id', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    // Get resource
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found',
        success: false
      });
    }
    
    // Update project's manpowerAllocated
    const project = await Project.findById(resource.projectId);
    if (project) {
      let currentManpower = project.manpowerAllocated || 0;
      currentManpower -= resource.hoursAllocated;
      
      await Project.findByIdAndUpdate(
        resource.projectId,
        { $set: { manpowerAllocated: Math.max(0, currentManpower) } } // Ensure it doesn't go below 0
      );
    }
    
    // Delete resource
    await Resource.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Resource removed successfully',
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

// @route   GET /api/resources/summary
// @desc    Get resources summary
// @access  Private (any authenticated user)
router.get('/summary', auth, async (req, res) => {
  try {
    // Get all resources
    const resources = await Resource.find();
    
    // Calculate total allocated hours
    const totalAllocated = resources.reduce((sum, resource) => sum + resource.hoursAllocated, 0);
    
    // Calculate average hourly rate
    const totalCost = resources.reduce((sum, resource) => sum + (resource.hoursAllocated * resource.hourlyRate), 0);
    const averageCost = resources.length > 0 ? totalCost / totalAllocated : 0;
    
    // Count projects with resources
    const projectsWithResources = new Set(resources.map(resource => resource.projectId.toString())).size;
    
    // Build response
    const summary = {
      totalAllocated,
      averageCost,
      projectsWithResources
    };
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating resources summary:', error);
    res.status(500).json({
      message: 'Server error generating resources summary',
      success: false
    });
  }
});

// @route   GET /api/resources/project/:id
// @desc    Get resources for a specific project
// @access  Private (any authenticated user)
router.get('/project/:id', auth, async (req, res) => {
  try {
    // Check if project exists
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        success: false
      });
    }
    
    // Get resources for the project
    const resources = await Resource.find({ projectId: req.params.id })
      .sort({ startDate: -1 });
    
    res.status(200).json(resources);
  } catch (error) {
    console.error(`Error fetching resources for project ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching project resources',
      success: false
    });
  }
});

module.exports = router;
