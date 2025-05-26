
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/business_management_system';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedData = async () => {
  try {
    // Clear existing users only
    await User.deleteMany({});

    console.log('Cleared existing users');

    // Create exactly 3 users with 3 different roles
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      createdAt: new Date("2025-01-01")
    });

    const managerUser = await User.create({
      name: "Manager User", 
      email: "manager@example.com",
      password: "manager123",
      role: "manager",
      createdAt: new Date("2025-01-05")
    });

    const regularUser = await User.create({
      name: "Regular User",
      email: "user@example.com", 
      password: "user123",
      role: "user",
      managerId: managerUser._id,
      createdAt: new Date("2025-01-10")
    });

    console.log('Created 3 users with different roles:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- Manager: manager@example.com / manager123'); 
    console.log('- User: user@example.com / user123');
    
    console.log('Database seeded successfully with users only!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
