
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  logo: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  managers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  projects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  }]
}, { timestamps: true });

// Transform _id to id for frontend compatibility
CompanySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Virtual for formatting company address
CompanySchema.virtual('formattedAddress').get(function() {
  if (!this.address) return 'No address provided';
  
  return [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean).join(', ');
});

module.exports = mongoose.model('Company', CompanySchema);
