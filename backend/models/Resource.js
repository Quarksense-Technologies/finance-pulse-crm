
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  hourlyRate: { 
    type: Number, 
    default: 0 
  },
  skills: [String],
  department: String,
  isActive: {
    type: Boolean,
    default: true
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
