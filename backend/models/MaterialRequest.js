
const mongoose = require('mongoose');

const MaterialRequestSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  partNo: String,
  quantity: { 
    type: Number, 
    required: true 
  },
  estimatedCost: Number,
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'purchased'],
    default: 'pending'
  },
  requestedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  rejectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  notes: String
}, { timestamps: true });

// Transform _id to id for frontend compatibility
MaterialRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('MaterialRequest', MaterialRequestSchema);
