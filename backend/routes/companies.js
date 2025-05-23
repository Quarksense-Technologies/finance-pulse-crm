
const express = require('express');
const { check, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private (any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      message: 'Server error fetching companies',
      success: false
    });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid company ID format',
        success: false
      });
    }

    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: 'Company not found',
        success: false
      });
    }
    
    // Get associated projects
    const projects = await Project.find({ companyId: company._id });
    
    // Create response with projects included
    const response = company.toJSON();
    response.projects = projects.map(project => ({
      id: project._id,
      name: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate
    }));
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching company ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching company',
      success: false
    });
  }
});

// @route   POST /api/companies
// @desc    Create company
// @access  Admin or Manager
router.post(
  '/',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('name', 'Company name is required').not().isEmpty()
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
        logo, 
        address, 
        contactInfo, 
        managers 
      } = req.body;

      // Create new company
      const company = new Company({
        name,
        description,
        logo,
        address,
        contactInfo,
        managers: managers || [],
        projects: []
      });

      await company.save();
      
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({
        message: 'Server error creating company',
        success: false
      });
    }
  }
);

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Admin or Manager
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      // Validate ID format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: 'Invalid company ID format',
          success: false
        });
      }

      // Check if company exists
      let company = await Company.findById(req.params.id);
      
      if (!company) {
        return res.status(404).json({
          message: 'Company not found',
          success: false
        });
      }
      
      // Update company with only provided fields
      const updateData = {};
      const { name, description, logo, address, contactInfo, managers } = req.body;
      
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (logo !== undefined) updateData.logo = logo;
      if (address) updateData.address = address;
      if (contactInfo) updateData.contactInfo = contactInfo;
      if (managers) updateData.managers = managers;
      
      // Update company
      company = await Company.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      
      res.status(200).json(company);
    } catch (error) {
      console.error(`Error updating company ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating company',
        success: false
      });
    }
  }
);

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Admin only
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid company ID format',
        success: false
      });
    }

    // Check if company exists
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: 'Company not found',
        success: false
      });
    }
    
    // Check if company has projects
    const projects = await Project.find({ companyId: company._id });
    
    if (projects.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete company with associated projects',
        success: false
      });
    }
    
    // Delete company
    await Company.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Company deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting company ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting company',
      success: false
    });
  }
});

module.exports = router;
