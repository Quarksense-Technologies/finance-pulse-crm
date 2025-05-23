
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  role: String,
  hoursAllocated: { 
    type: Number, 
    default: 0 
  },
  hourlyRate: { 
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
  }
}, { timestamps: true });

// Transform _id to id for frontend compatibility
ResourceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
