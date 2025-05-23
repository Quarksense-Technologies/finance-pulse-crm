
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
    // Get pending transactions
    const pendingTransactions = await Transaction.find({ approvalStatus: 'pending' })
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
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
    
    res.status(200).json(approvalItems);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      message: 'Server error fetching pending approvals',
      success: false
    });
  }
});

module.exports = router;
