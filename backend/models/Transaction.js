
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['expense', 'payment', 'income'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'other'
  },
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
      // Only expenses need approval by default, payments and income are auto-approved
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
    data: String, // Base64 encoded file data
    contentType: String, // MIME type
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
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
