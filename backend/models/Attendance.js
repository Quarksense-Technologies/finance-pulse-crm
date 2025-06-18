
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  projectResourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProjectResource', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  checkInTime: { 
    type: String, 
    required: true 
  },
  checkOutTime: { 
    type: String, 
    required: true 
  },
  totalHours: { 
    type: Number, 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Transform _id to id for frontend compatibility
AttendanceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Create compound index to prevent duplicate entries for same resource allocation on same date
AttendanceSchema.index({ projectResourceId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
