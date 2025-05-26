
const express = require('express');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/approvals/pending
// @desc    Get pending approval items
// @access  Admin or Manager
router.get('/pending', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    console.log('Fetching pending approvals...');
    
    // Get pending transactions
    const pendingTransactions = await Transaction.find({ approvalStatus: 'pending' })
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${pendingTransactions.length} pending transactions`);
    
    // Format response for frontend
    const approvalItems = await Promise.all(pendingTransactions.map(async (item) => {
      // Get project name
      let projectName = 'Unknown Project';
      if (item.project) {
        projectName = typeof item.project === 'object' ? item.project.name : 'Unknown Project';
        
        // If project is just an ID, fetch the project to get the name
        if (typeof item.project !== 'object') {
          try {
            const project = await Project.findById(item.project);
            if (project) {
              projectName = project.name;
            }
          } catch (err) {
            console.error('Error fetching project name:', err);
          }
        }
      }
      
      return {
        id: item._id,
        type: item.type,
        description: item.description || `${item.type} - ${item.amount}`,
        amount: item.amount,
        createdBy: {
          id: item.createdBy ? (typeof item.createdBy === 'object' ? item.createdBy._id : item.createdBy) : 'unknown',
          name: item.createdBy && typeof item.createdBy === 'object' ? item.createdBy.name : 'Unknown User'
        },
        createdAt: item.createdAt,
        status: item.approvalStatus,
        projectId: item.project ? (typeof item.project === 'object' ? item.project._id : item.project) : 'unknown',
        projectName
      };
    }));
    
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

// @route   PUT /api/approvals/:type/:id/approve
// @desc    Approve an item
// @access  Admin or Manager
router.put('/:type/:id/approve', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { type, id } = req.params;
    console.log(`Approving ${type} with ID: ${id}`);
    
    if (type === 'finances' || type === 'transactions') {
      // Update transaction approval status
      const transaction = await Transaction.findByIdAndUpdate(
        id,
        { 
          approvalStatus: 'approved',
          approvedBy: req.user.id,
          approvedAt: new Date()
        },
        { new: true }
      );
      
      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
      
      console.log('Transaction approved successfully:', transaction._id);
      res.status(200).json({
        message: 'Transaction approved successfully',
        success: true,
        data: transaction
      });
    } else {
      res.status(400).json({
        message: 'Invalid approval type',
        success: false
      });
    }
  } catch (error) {
    console.error(`Error approving ${req.params.type} ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error approving item',
      success: false
    });
  }
});

// @route   PUT /api/approvals/:type/:id/reject
// @desc    Reject an item
// @access  Admin or Manager
router.put('/:type/:id/reject', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;
    console.log(`Rejecting ${type} with ID: ${id}, reason: ${reason}`);
    
    if (type === 'finances' || type === 'transactions') {
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
      );
      
      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
      
      console.log('Transaction rejected successfully:', transaction._id);
      res.status(200).json({
        message: 'Transaction rejected successfully',
        success: true,
        data: transaction
      });
    } else {
      res.status(400).json({
        message: 'Invalid approval type',
        success: false
      });
    }
  } catch (error) {
    console.error(`Error rejecting ${req.params.type} ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error rejecting item',
      success: false
    });
  }
});

module.exports = router;
