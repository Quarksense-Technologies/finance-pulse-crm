
const express = require('express');
const { check, validationResult } = require('express-validator');
const MaterialRequest = require('../models/MaterialRequest');
const MaterialPurchase = require('../models/MaterialPurchase');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/materials/requests
// @desc    Get all material requests with filters
// @access  Private (any authenticated user)
router.get('/requests', auth, async (req, res) => {
  try {
    const { project, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (project) filter.projectId = project;
    if (status) filter.status = status;
    
    // Get material requests
    const requests = await MaterialRequest.find(filter)
      .populate('projectId', 'name')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching material requests:', error);
    res.status(500).json({
      message: 'Server error fetching material requests',
      success: false
    });
  }
});

// @route   GET /api/materials/purchases
// @desc    Get all material purchases with filters
// @access  Private (any authenticated user)
router.get('/purchases', auth, async (req, res) => {
  try {
    const { project } = req.query;
    
    // Build filter object
    const filter = {};
    if (project) filter.projectId = project;
    
    // Get material purchases
    const purchases = await MaterialPurchase.find(filter)
      .populate('projectId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching material purchases:', error);
    res.status(500).json({
      message: 'Server error fetching material purchases',
      success: false
    });
  }
});

// @route   POST /api/materials/requests
// @desc    Create material request
// @access  Private (any authenticated user)
router.post(
  '/requests',
  auth,
  [
    check('projectId', 'Project ID is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isNumeric()
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
        projectId, 
        description, 
        partNo, 
        quantity, 
        estimatedCost,
        urgency,
        notes
      } = req.body;

      // Check if project exists
      const projectExists = await Project.findById(projectId);
      if (!projectExists) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      // Create material request
      const materialRequest = new MaterialRequest({
        projectId,
        description,
        partNo,
        quantity,
        estimatedCost,
        urgency: urgency || 'medium',
        notes,
        requestedBy: req.user.id
      });
      
      await materialRequest.save();
      
      // Populate the response
      await materialRequest.populate('projectId', 'name');
      await materialRequest.populate('requestedBy', 'name');
      
      res.status(201).json(materialRequest);
    } catch (error) {
      console.error('Error creating material request:', error);
      res.status(500).json({
        message: 'Server error creating material request',
        success: false
      });
    }
  }
);

// @route   POST /api/materials/purchases
// @desc    Create material purchase and auto-create expense
// @access  Private (Manager/Admin)
router.post(
  '/purchases',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('projectId', 'Project ID is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number').isNumeric(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('totalAmount', 'Total amount is required and must be a number').isNumeric(),
    check('purchaseDate', 'Purchase date is required').isISO8601().toDate()
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
        projectId,
        description,
        partNo,
        hsn,
        quantity,
        price,
        gst,
        totalAmount,
        vendor,
        purchaseDate,
        invoiceNumber,
        attachments
      } = req.body;

      // Check if project exists
      const projectExists = await Project.findById(projectId);
      if (!projectExists) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      // Create material purchase
      const materialPurchase = new MaterialPurchase({
        projectId,
        description,
        partNo,
        hsn,
        quantity,
        price,
        gst: gst || 0,
        totalAmount,
        vendor,
        purchaseDate,
        invoiceNumber,
        attachments: attachments || [],
        createdBy: req.user.id
      });
      
      await materialPurchase.save();
      
      // Auto-create expense transaction
      const expenseTransaction = new Transaction({
        type: 'expense',
        amount: totalAmount,
        description: `Material Purchase: ${description}`,
        category: 'materials',
        project: projectId,
        date: purchaseDate,
        attachments: attachments || [],
        createdBy: req.user.id,
        approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
        approvedBy: req.user.role === 'admin' ? req.user.id : null,
        status: 'paid' // Material purchases are typically already paid
      });
      
      await expenseTransaction.save();
      
      // Link the expense to the purchase
      materialPurchase.expenseId = expenseTransaction._id;
      await materialPurchase.save();
      
      // Populate the response
      await materialPurchase.populate('projectId', 'name');
      await materialPurchase.populate('createdBy', 'name');
      
      res.status(201).json({
        purchase: materialPurchase,
        expense: expenseTransaction,
        message: 'Material purchase created and expense added successfully'
      });
    } catch (error) {
      console.error('Error creating material purchase:', error);
      res.status(500).json({
        message: 'Server error creating material purchase',
        success: false
      });
    }
  }
);

// @route   PUT /api/materials/requests/:id/approve
// @desc    Approve material request
// @access  Admin or Manager
router.put(
  '/requests/:id/approve',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      // Check if request exists
      const materialRequest = await MaterialRequest.findById(req.params.id);
      
      if (!materialRequest) {
        return res.status(404).json({
          message: 'Material request not found',
          success: false
        });
      }
      
      // Check if already approved
      if (materialRequest.status === 'approved') {
        return res.status(400).json({
          message: 'Material request already approved',
          success: false
        });
      }
      
      // Update request
      const updatedRequest = await MaterialRequest.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: 'approved',
            approvedBy: req.user.id,
            approvedAt: new Date()
          }
        },
        { new: true }
      ).populate('projectId', 'name')
       .populate('requestedBy', 'name')
       .populate('approvedBy', 'name');
      
      res.status(200).json(updatedRequest);
    } catch (error) {
      console.error(`Error approving material request ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error approving material request',
        success: false
      });
    }
  }
);

// @route   PUT /api/materials/requests/:id/reject
// @desc    Reject material request
// @access  Admin or Manager
router.put(
  '/requests/:id/reject',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('reason', 'Rejection reason is required').not().isEmpty()
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
      const { reason } = req.body;
      
      // Check if request exists
      const materialRequest = await MaterialRequest.findById(req.params.id);
      
      if (!materialRequest) {
        return res.status(404).json({
          message: 'Material request not found',
          success: false
        });
      }
      
      // Check if already rejected
      if (materialRequest.status === 'rejected') {
        return res.status(400).json({
          message: 'Material request already rejected',
          success: false
        });
      }
      
      // Update request
      const updatedRequest = await MaterialRequest.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status: 'rejected',
            rejectionReason: reason,
            rejectedBy: req.user.id,
            rejectedAt: new Date()
          }
        },
        { new: true }
      ).populate('projectId', 'name')
       .populate('requestedBy', 'name')
       .populate('rejectedBy', 'name');
      
      res.status(200).json(updatedRequest);
    } catch (error) {
      console.error(`Error rejecting material request ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error rejecting material request',
        success: false
      });
    }
  }
);

// @route   DELETE /api/materials/requests/:id
// @desc    Delete material request
// @access  Admin only or creator
router.delete('/requests/:id', auth, async (req, res) => {
  try {
    // Check if request exists
    const materialRequest = await MaterialRequest.findById(req.params.id);
    
    if (!materialRequest) {
      return res.status(404).json({
        message: 'Material request not found',
        success: false
      });
    }
    
    // Check if user is authorized to delete
    if (materialRequest.requestedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized to delete this request',
        success: false
      });
    }
    
    // Delete request
    await MaterialRequest.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Material request deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting material request ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting material request',
      success: false
    });
  }
});

// @route   DELETE /api/materials/purchases/:id
// @desc    Delete material purchase
// @access  Admin only
router.delete('/purchases/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Check if purchase exists
    const materialPurchase = await MaterialPurchase.findById(req.params.id);
    
    if (!materialPurchase) {
      return res.status(404).json({
        message: 'Material purchase not found',
        success: false
      });
    }
    
    // Delete associated expense if exists
    if (materialPurchase.expenseId) {
      await Transaction.findByIdAndDelete(materialPurchase.expenseId);
    }
    
    // Delete purchase
    await MaterialPurchase.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Material purchase deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting material purchase ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting material purchase',
      success: false
    });
  }
});

module.exports = router;
