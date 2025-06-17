
const mongoose = require('mongoose');

const MaterialPurchaseSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  partNo: {
    type: String,
    default: ''
  },
  hsn: {
    type: String,
    default: ''
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  gst: { 
    type: Number, 
    default: 0,
    min: 0
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  vendor: {
    type: String,
    default: ''
  },
  purchaseDate: { 
    type: Date, 
    required: true 
  },
  invoiceNumber: {
    type: String,
    default: ''
  },
  attachments: [{
    name: String,
    url: String,
    type: String // 'image' or 'pdf'
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  expenseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction' 
  }
}, { timestamps: true });

// Transform _id to id for frontend compatibility
MaterialPurchaseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('MaterialPurchase', MaterialPurchaseSchema);
