
const express = require('express');
const { check, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Company = require('../models/Company');
const Transaction = require('../models/Transaction');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects with optional filters
// @access  Private (any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const { status, companyId } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;
    
    // Get projects with filter
    let projects = await Project.find(filter)
      .populate('companyId', 'name') // Get only company name
      .sort({ createdAt: -1 });
    
    // Format projects with company name
    projects = projects.map(project => {
      const formattedProject = project.toJSON();
      formattedProject.companyName = project.companyId ? project.companyId.name : '';
      return formattedProject;
    });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      message: 'Server error fetching projects',
      success: false
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('managers', 'name')
      .populate('team', 'name');
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        success: false
      });
    }
    
    // Get project payments
    const payments = await Transaction.find({
      project: project._id,
      type: { $in: ['payment', 'income'] }
    }).sort({ date: -1 });
    
    // Get project expenses
    const expenses = await Transaction.find({
      project: project._id,
      type: 'expense'
    }).sort({ date: -1 });
    
    // Get project resources
    const resources = await Resource.find({
      projectId: project._id
    }).sort({ startDate: -1 });
    
    // Format response
    const response = project.toJSON();
    response.companyName = project.companyId ? project.companyId.name : '';
    response.payments = payments;
    response.expenses = expenses;
    response.resources = resources;
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching project',
      success: false
    });
  }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Admin or Manager
router.post(
  '/',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('name', 'Project name is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601().toDate(),
    check('status', 'Status must be valid').isIn([
      'planning', 'in-progress', 'on-hold', 'completed', 'cancelled'
    ])
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
      const { 
        name, 
        description, 
        company, // This is the company ID
        startDate,
        endDate,
        status,
        budget,
        managers,
        team
      } = req.body;

      // Verify company exists
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(404).json({
          message: 'Company not found',
          success: false
        });
      }

      // Create new project
      const project = new Project({
        name,
        description,
        companyId: company, // Set correct field name to match schema
        startDate,
        endDate: endDate || null,
        status,
        budget,
        managers: managers || [],
        team: team || []
      });

      await project.save();
      
      // Update company with project reference
      await Company.findByIdAndUpdate(
        company,
        { $push: { projects: project._id } }
      );
      
      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        message: 'Server error creating project',
        success: false
      });
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin or Manager
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      // Check if project exists
      let project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      // Update project with only provided fields
      const updateData = {};
      const { 
        name, 
        description, 
        company,
        startDate,
        endDate,
        status,
        budget,
        managers,
        team
      } = req.body;
      
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (company) {
        // Verify new company exists if changing
        const companyExists = await Company.findById(company);
        if (!companyExists) {
          return res.status(404).json({
            message: 'Company not found',
            success: false
          });
        }
        
        // Update company references
        if (project.companyId.toString() !== company) {
          // Remove project from old company
          await Company.findByIdAndUpdate(
            project.companyId,
            { $pull: { projects: project._id } }
          );
          
          // Add project to new company
          await Company.findByIdAndUpdate(
            company,
            { $push: { projects: project._id } }
          );
          
          updateData.companyId = company;
        }
      }
      if (startDate) updateData.startDate = startDate;
      if (endDate !== undefined) updateData.endDate = endDate;
      if (status) updateData.status = status;
      if (budget !== undefined) updateData.budget = budget;
      if (managers) updateData.managers = managers;
      if (team) updateData.team = team;
      
      // Update project
      project = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      
      res.status(200).json(project);
    } catch (error) {
      console.error(`Error updating project ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating project',
        success: false
      });
    }
  }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Admin only
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Check if project exists
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        success: false
      });
    }

    // Check for associated transactions
    const transactions = await Transaction.find({ project: project._id });
    if (transactions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete project with associated transactions',
        success: false
      });
    }
    
    // Check for associated resources
    const resources = await Resource.find({ projectId: project._id });
    if (resources.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete project with associated resources',
        success: false
      });
    }
    
    // Remove project from company
    await Company.findByIdAndUpdate(
      project.companyId,
      { $pull: { projects: project._id } }
    );
    
    // Delete project
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Project deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting project',
      success: false
    });
  }
});

// @route   POST /api/projects/:id/payments
// @desc    Add payment to project
// @access  Admin or Manager
router.post(
  '/:id/payments',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('date', 'Date is required').isISO8601().toDate(),
    check('status', 'Status must be valid').isIn(['paid', 'pending', 'overdue'])
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
      // Check if project exists
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      const { amount, date, status, description } = req.body;
      
      // Create payment transaction
      const payment = new Transaction({
        type: 'payment',
        amount,
        date,
        status,
        description,
        project: project._id,
        createdBy: req.user.id,
        approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
        approvedBy: req.user.role === 'admin' ? req.user.id : null
      });
      
      await payment.save();
      
      res.status(201).json(payment);
    } catch (error) {
      console.error(`Error adding payment to project ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error adding payment',
        success: false
      });
    }
  }
);

// @route   POST /api/projects/:id/expenses
// @desc    Add expense to project
// @access  Private (any authenticated user)
router.post(
  '/:id/expenses',
  auth,
  [
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('date', 'Date is required').isISO8601().toDate(),
    check('category', 'Category is required').not().isEmpty()
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
      // Check if project exists
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      const { amount, date, category, description } = req.body;
      
      // Create expense transaction
      const expense = new Transaction({
        type: 'expense',
        amount,
        date,
        category,
        description,
        project: project._id,
        createdBy: req.user.id,
        approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
        approvedBy: req.user.role === 'admin' ? req.user.id : null
      });
      
      await expense.save();
      
      res.status(201).json(expense);
    } catch (error) {
      console.error(`Error adding expense to project ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error adding expense',
        success: false
      });
    }
  }
);

// @route   POST /api/projects/:id/resources
// @desc    Add resource to project
// @access  Admin or Manager
router.post(
  '/:id/resources',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('hoursAllocated', 'Hours allocated must be a number').isNumeric(),
    check('hourlyRate', 'Hourly rate must be a number').isNumeric(),
    check('startDate', 'Start date is required').isISO8601().toDate()
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
      // Check if project exists
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      const { name, role, hoursAllocated, hourlyRate, startDate, endDate } = req.body;
      
      // Create resource
      const resource = new Resource({
        name,
        role,
        hoursAllocated,
        hourlyRate,
        startDate,
        endDate,
        projectId: project._id
      });
      
      await resource.save();
      
      // Update project's manpowerAllocated
      let currentManpower = project.manpowerAllocated || 0;
      currentManpower += hoursAllocated;
      
      await Project.findByIdAndUpdate(
        req.params.id,
        { $set: { manpowerAllocated: currentManpower } }
      );
      
      res.status(201).json(resource);
    } catch (error) {
      console.error(`Error adding resource to project ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error adding resource',
        success: false
      });
    }
  }
);

module.exports = router;
