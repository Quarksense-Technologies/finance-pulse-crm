
const express = require('express');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/approvals/pending
// @desc    Get pending approval items (only expenses need approval, not payments)
// @access  Admin or Manager
router.get('/pending', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    console.log('Fetching pending approvals...');
    
    // Get pending expense transactions only (payments don't need approval in this flow)
    const pendingTransactions = await Transaction.find({ 
      approvalStatus: 'pending',
      type: 'expense' // Only expenses need approval
    })
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingTransactions.length} pending expense transactions`);
    
    // Format response for frontend
    const approvalItems = pendingTransactions.map((item) => {
      // Get project name safely
      let projectName = 'Unknown Project';
      let projectId = 'unknown';
      
      if (item.project) {
        if (typeof item.project === 'object' && item.project.name) {
          projectName = item.project.name;
          projectId = item.project._id;
        } else if (typeof item.project === 'string') {
          projectId = item.project;
          // Project name will be fetched separately if needed
        }
      }
      
      // Get creator name safely
      let creatorName = 'Unknown User';
      let creatorId = 'unknown';
      
      if (item.createdBy) {
        if (typeof item.createdBy === 'object' && item.createdBy.name) {
          creatorName = item.createdBy.name;
          creatorId = item.createdBy._id;
        } else if (typeof item.createdBy === 'string') {
          creatorId = item.createdBy;
        }
      }
      
      return {
        id: item._id,
        type: item.type, // This will be 'expense'
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
        project: item.project // Include full project object
      };
    });
    
    // For any items with unpopulated project names, fetch them
    for (let item of approvalItems) {
      if (item.projectName === 'Unknown Project' && item.projectId !== 'unknown') {
        try {
          const project = await Project.findById(item.projectId);
          if (project) {
            item.projectName = project.name;
          }
        } catch (err) {
          console.error('Error fetching project name for ID:', item.projectId, err);
        }
      }
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

module.exports = router;
