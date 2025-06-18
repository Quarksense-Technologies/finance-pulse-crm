
const express = require('express');
const { check, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const ProjectResource = require('../models/ProjectResource');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// @route   GET /api/attendance/project/:projectId
// @desc    Get attendance records for a specific project
// @access  Private (any authenticated user)
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { month, year } = req.query;

    // First get all project resource allocations for this project
    const projectResources = await ProjectResource.find({ 
      projectId, 
      isActive: true 
    });

    if (projectResources.length === 0) {
      return res.status(200).json([]);
    }

    const projectResourceIds = projectResources.map(pr => pr._id);

    // Build filter
    const filter = { projectResourceId: { $in: projectResourceIds } };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: 'projectResourceId',
        populate: [
          { path: 'resourceId', select: 'name role hourlyRate' },
          { path: 'projectId', select: 'name' }
        ]
      })
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(`Error fetching attendance for project ${req.params.projectId}:`, error);
    res.status(500).json({
      message: 'Server error fetching attendance records',
      success: false
    });
  }
});

// @route   GET /api/attendance/resource/:resourceId
// @desc    Get attendance records for a specific resource
// @access  Private (any authenticated user)
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { month, year } = req.query;

    // First get all project resource allocations for this resource
    const projectResources = await ProjectResource.find({ 
      resourceId, 
      isActive: true 
    });

    if (projectResources.length === 0) {
      return res.status(200).json([]);
    }

    const projectResourceIds = projectResources.map(pr => pr._id);

    // Build filter
    const filter = { projectResourceId: { $in: projectResourceIds } };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: 'projectResourceId',
        populate: [
          { path: 'resourceId', select: 'name role hourlyRate' },
          { path: 'projectId', select: 'name' }
        ]
      })
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error(`Error fetching attendance for resource ${req.params.resourceId}:`, error);
    res.status(500).json({
      message: 'Server error fetching attendance records',
      success: false
    });
  }
});

// @route   GET /api/attendance/report
// @desc    Get attendance report for all projects/resources
// @access  Private (any authenticated user)
router.get('/report', auth, async (req, res) => {
  try {
    const { month, year, projectId } = req.query;

    // Build filter for project resources
    const projectResourceFilter = {};
    if (projectId) {
      projectResourceFilter.projectId = projectId;
    }

    // Get project resources based on filter
    const projectResources = await ProjectResource.find({
      ...projectResourceFilter,
      isActive: true
    });

    if (projectResources.length === 0) {
      return res.status(200).json([]);
    }

    const projectResourceIds = projectResources.map(pr => pr._id);

    // Build attendance filter
    const attendanceFilter = { projectResourceId: { $in: projectResourceIds } };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      attendanceFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendanceRecords = await Attendance.find(attendanceFilter)
      .populate({
        path: 'projectResourceId',
        populate: [
          { path: 'resourceId', select: 'name role hourlyRate' },
          { path: 'projectId', select: 'name' }
        ]
      });

    // Group by resource and project combination
    const reportData = {};
    
    attendanceRecords.forEach(record => {
      const projectResource = record.projectResourceId;
      const key = `${projectResource.resourceId._id}-${projectResource.projectId._id}`;
      
      if (!reportData[key]) {
        reportData[key] = {
          resourceId: projectResource.resourceId._id,
          resourceName: projectResource.resourceId.name,
          resourceRole: projectResource.resourceId.role,
          projectId: projectResource.projectId._id,
          projectName: projectResource.projectId.name,
          month: month ? new Date(year, month - 1).toLocaleString('default', { month: 'long' }) : 'All',
          year: parseInt(year) || new Date().getFullYear(),
          totalHours: 0,
          totalDays: 0,
          hourlyRate: projectResource.resourceId.hourlyRate || 0,
          totalCost: 0
        };
      }
      
      reportData[key].totalHours += record.totalHours;
      reportData[key].totalDays += 1;
    });

    // Calculate total cost for each entry
    Object.values(reportData).forEach(entry => {
      entry.totalCost = entry.totalHours * entry.hourlyRate;
    });

    res.status(200).json(Object.values(reportData));
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      message: 'Server error generating attendance report',
      success: false
    });
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Admin or Manager
router.post(
  '/',
  auth,
  roleCheck(['admin', 'manager']),
  [
    check('projectResourceId', 'Project Resource ID is required').not().isEmpty(),
    check('date', 'Date is required').isISO8601().toDate(),
    check('checkInTime', 'Check-in time is required').not().isEmpty(),
    check('checkOutTime', 'Check-out time is required').not().isEmpty()
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
      const { projectResourceId, date, checkInTime, checkOutTime } = req.body;

      // Verify project resource allocation exists
      const projectResource = await ProjectResource.findById(projectResourceId)
        .populate('resourceId', 'name role hourlyRate')
        .populate('projectId', 'name');

      if (!projectResource) {
        return res.status(404).json({
          message: 'Project resource allocation not found',
          success: false
        });
      }

      if (!projectResource.isActive) {
        return res.status(400).json({
          message: 'Project resource allocation is not active',
          success: false
        });
      }

      // Calculate total hours
      const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
      const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
      const diffMs = checkOut - checkIn;
      const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places

      if (totalHours <= 0) {
        return res.status(400).json({
          message: 'Check-out time must be after check-in time',
          success: false
        });
      }

      // Check if attendance record already exists for this date
      const existingAttendance = await Attendance.findOne({
        projectResourceId,
        date: new Date(date)
      });

      if (existingAttendance) {
        return res.status(400).json({
          message: 'Attendance record already exists for this resource on this date',
          success: false
        });
      }

      // Create attendance record
      const attendance = new Attendance({
        projectResourceId,
        date: new Date(date),
        checkInTime,
        checkOutTime,
        totalHours,
        createdBy: req.user.id
      });

      await attendance.save();

      // Populate the response
      await attendance.populate({
        path: 'projectResourceId',
        populate: [
          { path: 'resourceId', select: 'name role hourlyRate' },
          { path: 'projectId', select: 'name' }
        ]
      });

      res.status(201).json(attendance);
    } catch (error) {
      console.error('Error creating attendance record:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          message: 'Attendance record already exists for this resource on this date',
          success: false
        });
      }
      
      res.status(500).json({
        message: 'Server error creating attendance record',
        success: false
      });
    }
  }
);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Admin or Manager
router.put(
  '/:id',
  auth,
  roleCheck(['admin', 'manager']),
  async (req, res) => {
    try {
      const { checkInTime, checkOutTime } = req.body;

      let attendance = await Attendance.findById(req.params.id);

      if (!attendance) {
        return res.status(404).json({
          message: 'Attendance record not found',
          success: false
        });
      }

      // Update fields if provided
      if (checkInTime) attendance.checkInTime = checkInTime;
      if (checkOutTime) attendance.checkOutTime = checkOutTime;

      // Recalculate total hours if times were updated
      if (checkInTime || checkOutTime) {
        const checkIn = new Date(`1970-01-01T${attendance.checkInTime}:00`);
        const checkOut = new Date(`1970-01-01T${attendance.checkOutTime}:00`);
        const diffMs = checkOut - checkIn;
        const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

        if (totalHours <= 0) {
          return res.status(400).json({
            message: 'Check-out time must be after check-in time',
            success: false
          });
        }

        attendance.totalHours = totalHours;
      }

      await attendance.save();

      // Populate the response
      await attendance.populate({
        path: 'projectResourceId',
        populate: [
          { path: 'resourceId', select: 'name role hourlyRate' },
          { path: 'projectId', select: 'name' }
        ]
      });

      res.status(200).json(attendance);
    } catch (error) {
      console.error(`Error updating attendance record ${req.params.id}:`, error);
      res.status(500).json({
        message: 'Server error updating attendance record',
        success: false
      });
    }
  }
);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Admin or Manager
router.delete('/:id', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
        success: false
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Attendance record deleted successfully',
      success: true
    });
  } catch (error) {
    console.error(`Error deleting attendance record ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Server error deleting attendance record',
      success: false
    });
  }
});

module.exports = router;
