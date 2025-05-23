
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  description: String,
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date,
    default: null
  },
  status: { 
    type: String, 
    enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: Number,
  managers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  team: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  manpowerAllocated: Number
}, { timestamps: true });

// Transform _id to id for frontend compatibility
ProjectSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
  virtuals: true
});

// Virtual for company name (populated after looking up company)
ProjectSchema.virtual('companyName');

// Virtual for payments
ProjectSchema.virtual('payments', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'project',
  match: { type: { $in: ['payment', 'income'] } }
});

// Virtual for expenses
ProjectSchema.virtual('expenses', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'project',
  match: { type: 'expense' }
});

// Virtual for resources
ProjectSchema.virtual('resources', {
  ref: 'Resource',
  localField: '_id',
  foreignField: 'projectId'
});

module.exports = mongoose.model('Project', ProjectSchema);
