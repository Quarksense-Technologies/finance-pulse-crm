
const mongoose = require('mongoose');

const ExpenseCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  }
}, { timestamps: true });

// Transform _id to id for frontend compatibility
ExpenseCategorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('ExpenseCategory', ExpenseCategorySchema);
