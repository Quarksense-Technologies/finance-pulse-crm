const express = require('express');
const { check, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const ExpenseCategory = require('../models/ExpenseCategory');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/finances
// @desc    Get all transactions with filters
// @access  Private (any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const { project, type, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    if (project) filter.project = project;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // For project-specific queries, only show approved expenses and all payments/income
    if (project) {
      filter.$or = [
        { type: { $in: ['payment', 'income'] } }, // All payments and income
        { type: 'expense', approvalStatus: 'approved' } // Only approved expenses
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });
    
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Server error fetching transactions',
      success: false
    });
  }
});

// @route   GET /api/finances/summary
// @desc    Get financial summary
// @access  Private (any authenticated user)
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate, company, project } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Project filter
    if (project) {
      filter.project = project;
    } else if (company) {
      // If company filter, get all projects for that company
      const projects = await Project.find({ companyId: company }).select('_id');
      filter.project = { $in: projects.map(p => p._id) };
    }
    
    // Only include approved expenses and all payments/income in summary
    filter.$or = [
      { type: { $in: ['payment', 'income'] } }, // All payments and income
      { type: 'expense', approvalStatus: 'approved' } // Only approved expenses
    ];
    
    // Get all transactions with the filter
    const transactions = await Transaction.find(filter);
    
    // Calculate summary
    const totalRevenue = transactions
      .filter(t => t.type === 'payment' || t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.approvalStatus === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const pendingPayments = transactions
      .filter(t => (t.type === 'payment' || t.type === 'income') && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const overduePayments = transactions
      .filter(t => (t.type === 'payment' || t.type === 'income') && t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Build response
    const summary = {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      pendingPayments,
      overduePayments
    };
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating financial summary:', error);
    res.status(500).json({
      message: 'Server error generating financial summary',
      success: false
    });
  }
});

// @route   GET /api/finances/export
// @desc    Export transactions
// @access  Private (any authenticated user)
router.get('/export', auth, async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter)
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });
    
    // Format data for export
    const formattedData = transactions.map(t => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: t.category,
      project: t.project ? t.project.name : 'Unknown Project',
      date: t.date.toISOString().split('T')[0],
      status: t.status,
      approvalStatus: t.approvalStatus,
      createdBy: t.createdBy ? t.createdBy.name : 'Unknown User',
      approvedBy: t.approvedBy ? t.approvedBy.name : 'Not Approved'
    }));
    
    // This would typically include code to generate CSV or other formats
    // But for simplicity, we'll just return JSON
    res.status(200).json({
      format: format || 'json',
      data: formattedData,
      success: true
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      message: 'Server error exporting transactions',
      success: false
    });
  }
});

// @route   GET /api/finances/chart-data
// @desc    Get financial chart data
// @access  Private (any authenticated user)
router.get('/chart-data', auth, async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get all months in the current year
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      months.push(date);
    }
    
    // Build chart data
    const incomeData = [];
    const expenseData = [];
    
    for (const month of months) {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Get income transactions for this month
      const incomeTransactions = await Transaction.find({
        type: { $in: ['payment', 'income'] },
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      // Get approved expense transactions for this month
      const expenseTransactions = await Transaction.find({
        type: 'expense',
        approvalStatus: 'approved',
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      // Calculate totals
      const monthlyIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      incomeData.push(monthlyIncome);
      expenseData.push(monthlyExpense);
    }
    
    // Format month labels
    const labels = months.map(date => date.toLocaleDateString('en-US', { month: 'short' }));
    
    // Build response
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10B981', // Green
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#EF4444', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderWidth: 2
        }
      ]
    };
    
    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error generating chart data:', error);
    res.status(500).json({
      message: 'Server error generating chart data',
      success: false
    });
  }
});

// @route   GET /api/finances/category-expenses
// @desc    Get expenses by category
// @access  Private (any authenticated user)
router.get('/category-expenses', auth, async (req, res) => {
  try {
    // Get all expense categories
    const categories = await ExpenseCategory.find();
    
    // Initialize category data
    const categoryData = {};
    categories.forEach(cat => {
      categoryData[cat.name] = 0;
    });
    categoryData['other'] = 0; // For uncategorized expenses
    
    // Get all approved expense transactions only
    const expenses = await Transaction.find({ 
      type: 'expense',
      approvalStatus: 'approved'
    });
    
    // Calculate total for each category
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (categoryData[category] !== undefined) {
        categoryData[category] += expense.amount;
      } else {
        categoryData['other'] += expense.amount;
      }
    });
    
    // Prepare chart data
    const chartData = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8BC34A', '#607D8B', '#E91E63', '#3F51B5',
            '#00BCD4', '#CDDC39', '#FF5722'
          ],
          borderWidth: 1
        }
      ]
    };
    
    res.status(200).json(chartData);
  } catch (error) {
    console.error('Error generating category expenses data:', error);
    res.status(500).json({
      message: 'Server error generating category expenses data',
      success: false
    });
  }
});

// @route   GET /api/finances/expense-categories
// @desc    Get expense categories
// @access  Private (any authenticated user)
router.get('/expense-categories', auth, async (req, res) => {
  try {
    const categories = await ExpenseCategory.find().sort({ name: 1 });
    
    // Extract category names
    const categoryNames = categories.map(cat => cat.name);
    
    res.status(200).json(categoryNames);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({
      message: 'Server error fetching expense categories',
      success: false
    });
  }
});

// @route   POST /api/finances/expense-categories
// @desc    Save expense category
// @access  Admin or Manager
router.post(
  '/expense-categories',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('category', 'Category name is required').not().isEmpty()
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
      const { category } = req.body;
      
      // Check if category already exists
      const existingCategory = await ExpenseCategory.findOne({ name: category });
      if (existingCategory) {
        return res.status(400).json({
          message: 'Category already exists',
          success: false
        });
      }
      
      // Create new category
      const newCategory = new ExpenseCategory({
        name: category
      });
      
      await newCategory.save();
      
      res.status(201).json({
        message: 'Category added successfully',
        category: newCategory.name,
        success: true
      });
    } catch (error) {
      console.error('Error saving expense category:', error);
      res.status(500).json({
        message: 'Server error saving expense category',
        success: false
      });
    }
  }
);

// @route   GET /api/finances/:id
// @desc    Get transaction by ID
// @access  Private (any authenticated user)
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');
    
    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        success: false
      });
    }
    
    res.status(200).json(transaction);
  } catch (error) {
    console.error(`Error fetching transaction ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error fetching transaction',
      success: false
    });
  }
});

// @route   POST /api/finances
// @desc    Create transaction
// @access  Private (any authenticated user)
router.post(
  '/',
  auth,
  [
    check('type', 'Type must be expense, payment, or income').isIn(['expense', 'payment', 'income']),
    check('amount', 'Amount is required and must be a number').isNumeric(),
    check('project', 'Project is required').not().isEmpty(),
    check('date', 'Date is required').isISO8601().toDate()
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
        type, 
        amount, 
        description, 
        category,
        project,
        date,
        status,
        attachments
      } = req.body;

      // Check if project exists
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(404).json({
          message: 'Project not found',
          success: false
        });
      }
      
      // Determine approval status based on type and user role
      let approvalStatus = 'pending';
      let approvedBy = null;
      
      if (type === 'expense') {
        // Expenses need approval unless created by admin
        approvalStatus = req.user.role === 'admin' ? 'approved' : 'pending';
        approvedBy = req.user.role === 'admin' ? req.user.id : null;
      } else {
        // Payments and income are auto-approved
        approvalStatus = 'approved';
        approvedBy = req.user.id;
      }
      
      // Create transaction
      const transaction = new Transaction({
        type,
        amount,
        description,
        category: type === 'expense' ? category : undefined,
        project,
        date,
        attachments: attachments || [],
        createdBy: req.user.id,
        approvalStatus,
        approvedBy,
        // Set status for both payments and expenses
        status: status || 'pending'
      });
      
      await transaction.save();
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        message: 'Server error creating transaction',
        success: false
      });
    }
  }
);

// @route   PUT /api/finances/:id
// @desc    Update transaction
// @access  Private (any authenticated user)
router.put(
  '/:id',
  auth,
  async (req, res) => {
    try {
      // Check if transaction exists
      let transaction = await Transaction.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
      
      // Check if user is authorized to update
      if (transaction.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({
          message: 'Not authorized to update this transaction',
          success: false
        });
      }
      
      // Check if transaction is already approved/rejected
      if (transaction.approvalStatus !== 'pending' && req.user.role !== 'admin') {
        return res.status(400).json({
          message: 'Cannot update transaction that is already approved or rejected',
          success: false
        });
      }
      
      // Update transaction with only provided fields
      const updateData = {};
      const { 
        type,
        amount,
        description,
        category,
        project,
        date,
        status,
        attachments
      } = req.body;
      
      // Only allow changing these fields if transaction is pending
      if (transaction.approvalStatus === 'pending' || req.user.role === 'admin') {
        if (type) updateData.type = type;
        if (amount) updateData.amount = amount;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (project) {
          // Check if project exists
          const projectExists = await Project.findById(project);
          if (!projectExists) {
            return res.status(404).json({
              message: 'Project not found',
              success: false
            });
          }
          updateData.project = project;
        }
        if (date) updateData.date = date;
        // Allow status updates for both payments and expenses
        if (status) updateData.status = status;
        if (attachments) updateData.attachments = attachments;
      }
      
      // Update transaction
      transaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      
      res.status(200).json(transaction);
    } catch (error) {
      console.error(`Error updating transaction ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating transaction',
        success: false
      });
    }
  }
);

// @route   DELETE /api/finances/:id
// @desc    Delete transaction
// @access  Admin only
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Check if transaction exists
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
        success: false
      });
    }
    
    // Delete transaction
    await Transaction.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Transaction deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting transaction ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting transaction',
      success: false
    });
  }
});

// @route   PUT /api/finances/:id/approve
// @desc    Approve transaction
// @access  Admin or Manager
router.put(
  '/:id/approve',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      // Check if transaction exists
      const transaction = await Transaction.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
      
      // Check if already approved
      if (transaction.approvalStatus === 'approved') {
        return res.status(400).json({
          message: 'Transaction already approved',
          success: false
        });
      }
      
      // Update transaction
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            approvalStatus: 'approved',
            approvedBy: req.user.id
          }
        },
        { new: true }
      );
      
      res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error(`Error approving transaction ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error approving transaction',
        success: false
      });
    }
  }
);

// @route   PUT /api/finances/:id/reject
// @desc    Reject transaction
// @access  Admin or Manager
router.put(
  '/:id/reject',
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
      
      // Check if transaction exists
      const transaction = await Transaction.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
      
      // Check if already rejected
      if (transaction.approvalStatus === 'rejected') {
        return res.status(400).json({
          message: 'Transaction already rejected',
          success: false
        });
      }
      
      // Update transaction
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            approvalStatus: 'rejected',
            rejectionReason: reason,
            rejectedBy: req.user.id
          }
        },
        { new: true }
      );
      
      res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error(`Error rejecting transaction ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error rejecting transaction',
        success: false
      });
    }
  }
);

module.exports = router;
