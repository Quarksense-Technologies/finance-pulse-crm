
const mongoose = require('mongoose');

const ProjectResourceSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resource', 
    required: true 
  },
  hoursAllocated: { 
    type: Number, 
    default: 0 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Transform _id to id for frontend compatibility
ProjectResourceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Ensure one resource can only be allocated to one project at a time
ProjectResourceSchema.index({ resourceId: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});

module.exports = mongoose.model('ProjectResource', ProjectResourceSchema);
