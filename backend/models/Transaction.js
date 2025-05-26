
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['expense', 'payment', 'income'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: String,
  category: String,
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Only expenses need approval by default, payments are auto-approved
      return this.type === 'expense' ? 'pending' : 'approved';
    }
  },
  rejectionReason: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
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
  attachments: [{
    name: String,
    url: String
  }]
}, { timestamps: true });

// Transform _id to id for frontend compatibility
TransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
