
const express = require('express');
const Transaction = require('../models/Transaction');
const MaterialRequest = require('../models/MaterialRequest');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/approvals/pending
// @desc    Get pending approval items (expenses and material requests)
// @access  Admin or Manager
router.get('/pending', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    console.log('Fetching pending approvals...');
    
    // Get pending expense transactions
    const pendingTransactions = await Transaction.find({ 
      approvalStatus: 'pending',
      type: 'expense'
    })
      .populate({
        path: 'project',
        select: 'name',
        model: 'Project'
      })
      .populate({
        path: 'createdBy',
        select: 'name',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    // Get pending material requests
    const pendingMaterialRequests = await MaterialRequest.find({ 
      status: 'pending'
    })
      .populate({
        path: 'projectId',
        select: 'name',
        model: 'Project'
      })
      .populate({
        path: 'requestedBy',
        select: 'name',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingTransactions.length} pending expense transactions`);
    console.log(`Found ${pendingMaterialRequests.length} pending material requests`);
    
    // Format response for frontend
    const approvalItems = [];
    
    // Add expense transactions
    for (const item of pendingTransactions) {
      // Get project name safely
      let projectName = 'Unknown Project';
      let projectId = null;
      
      if (item.project) {
        if (typeof item.project === 'object') {
          projectName = item.project.name || 'Unknown Project';
          projectId = item.project._id;
        } else {
          try {
            const project = await Project.findById(item.project);
            if (project) {
              projectName = project.name;
              projectId = project._id;
            }
          } catch (err) {
            console.error('Error fetching project:', err);
          }
        }
      }
      
      let creatorName = 'Unknown User';
      let creatorId = null;
      
      if (item.createdBy) {
        if (typeof item.createdBy === 'object') {
          creatorName = item.createdBy.name || 'Unknown User';
          creatorId = item.createdBy._id;
        } else {
          creatorId = item.createdBy;
        }
      }
      
      approvalItems.push({
        id: item._id,
        type: item.type,
        description: item.description || `Expense claim - ${item.amount}`,
        amount: item.amount,
        category: item.category,
        createdBy: {
          id: creatorId,
          name: creatorName
        },
        createdAt: item.createdAt,
        date: item.date,
        status: item.approvalStatus,
        projectId: projectId,
        projectName: projectName,
        project: item.project,
        attachments: item.attachments
      });
    }
    
    // Add material requests
    for (const item of pendingMaterialRequests) {
      let projectName = 'Unknown Project';
      let projectId = null;
      
      if (item.projectId) {
        if (typeof item.projectId === 'object') {
          projectName = item.projectId.name || 'Unknown Project';
          projectId = item.projectId._id;
        } else {
          try {
            const project = await Project.findById(item.projectId);
            if (project) {
              projectName = project.name;
              projectId = project._id;
            }
          } catch (err) {
            console.error('Error fetching project:', err);
          }
        }
      }
      
      let requesterName = 'Unknown User';
      let requesterId = null;
      
      if (item.requestedBy) {
        if (typeof item.requestedBy === 'object') {
          requesterName = item.requestedBy.name || 'Unknown User';
          requesterId = item.requestedBy._id;
        } else {
          requesterId = item.requestedBy;
        }
      }
      
      approvalItems.push({
        id: item._id,
        type: 'material_request',
        description: `Material Request: ${item.description}`,
        amount: item.estimatedCost || 0,
        quantity: item.quantity,
        partNo: item.partNo,
        urgency: item.urgency,
        createdBy: {
          id: requesterId,
          name: requesterName
        },
        createdAt: item.createdAt,
        date: item.createdAt,
        status: item.status,
        projectId: projectId,
        projectName: projectName,
        project: item.projectId,
        notes: item.notes
      });
    }
    
    console.log('Formatted approval items:', approvalItems);
    res.status(200).json(approvalItems);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      message: 'Server error fetching pending approvals',
      success: false
    });
  }
});

// @route   PUT /api/approvals/finances/:id/approve
// @desc    Approve a transaction (expense)
// @access  Admin or Manager
router.put('/finances/:id/approve', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Approving expense with ID: ${id}`);
    
    // Update transaction approval status
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        approvalStatus: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('project', 'name');
    
    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        success: false
      });
    }
    
    console.log('Transaction approved successfully:', transaction._id);
    res.status(200).json({
      message: 'Expense approved successfully',
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(`Error approving expense ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error approving expense',
      success: false
    });
  }
});

// @route   PUT /api/approvals/finances/:id/reject
// @desc    Reject a transaction (expense)
// @access  Admin or Manager
router.put('/finances/:id/reject', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log(`Rejecting expense with ID: ${id}, reason: ${reason}`);
    
    // Update transaction approval status
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { 
        approvalStatus: 'rejected',
        rejectedBy: req.user.id,
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).populate('project', 'name');
    
    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        success: false
      });
    }
    
    console.log('Transaction rejected successfully:', transaction._id);
    res.status(200).json({
      message: 'Expense rejected successfully',
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(`Error rejecting expense ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error rejecting expense',
      success: false
    });
  }
});

// @route   PUT /api/approvals/materials/:id/approve
// @desc    Approve a material request
// @access  Admin or Manager
router.put('/materials/:id/approve', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Approving material request with ID: ${id}`);
    
    // Update material request status
    const materialRequest = await MaterialRequest.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('projectId', 'name');
    
    if (!materialRequest) {
      return res.status(404).json({
        message: 'Material request not found',
        success: false
      });
    }
    
    console.log('Material request approved successfully:', materialRequest._id);
    res.status(200).json({
      message: 'Material request approved successfully',
      success: true,
      data: materialRequest
    });
  } catch (error) {
    console.error(`Error approving material request ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error approving material request',
      success: false
    });
  }
});

// @route   PUT /api/approvals/materials/:id/reject
// @desc    Reject a material request
// @access  Admin or Manager
router.put('/materials/:id/reject', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log(`Rejecting material request with ID: ${id}, reason: ${reason}`);
    
    // Update material request status
    const materialRequest = await MaterialRequest.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: req.user.id,
        rejectedAt: new Date()
      },
      { new: true }
    ).populate('projectId', 'name');
    
    if (!materialRequest) {
      return res.status(404).json({
        message: 'Material request not found',
        success: false
      });
    }
    
    console.log('Material request rejected successfully:', materialRequest._id);
    res.status(200).json({
      message: 'Material request rejected successfully',
      success: true,
      data: materialRequest
    });
  } catch (error) {
    console.error(`Error rejecting material request ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error rejecting material request',
      success: false
    });
  }
});

module.exports = router;
