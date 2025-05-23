
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const Resource = require('../models/Resource');
const ExpenseCategory = require('../models/ExpenseCategory');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Project.deleteMany({});
    await Transaction.deleteMany({});
    await Resource.deleteMany({});
    await ExpenseCategory.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      createdAt: new Date("2025-01-01")
    });

    const managerUser = await User.create({
      name: "Manager User",
      email: "manager@example.com",
      password: "password123",
      role: "manager",
      createdAt: new Date("2025-01-05")
    });

    const regularUser = await User.create({
      name: "Regular User",
      email: "user@example.com",
      password: "password123",
      role: "user",
      managerId: managerUser._id,
      createdAt: new Date("2025-01-10")
    });

    console.log('Created users');

    // Create companies
    const acmeCompany = await Company.create({
      name: "Acme Corporation",
      description: "A leading technology company specializing in innovative solutions",
      logo: "https://via.placeholder.com/150",
      address: {
        street: "123 Business Ave",
        city: "Business City",
        state: "BS",
        zipCode: "12345",
        country: "USA"
      },
      contactInfo: {
        email: "contact@acme.com",
        phone: "(555) 123-4567",
        website: "www.acme.com"
      },
      managers: [managerUser._id]
    });

    const technovaCompany = await Company.create({
      name: "TechNova Solutions",
      description: "Innovative tech solutions provider",
      logo: "https://via.placeholder.com/150",
      address: {
        street: "456 Innovation Blvd",
        city: "Tech Park",
        state: "TP",
        zipCode: "67890",
        country: "USA"
      },
      contactInfo: {
        email: "contact@technova.com",
        phone: "(555) 987-6543",
        website: "www.technova.com"
      },
      managers: [managerUser._id]
    });

    const globalCompany = await Company.create({
      name: "Global Enterprises",
      description: "Multinational business solutions corporation",
      logo: "https://via.placeholder.com/150",
      address: {
        street: "789 Corporate Dr",
        city: "Enterprise Zone",
        state: "EZ",
        zipCode: "54321",
        country: "USA"
      },
      contactInfo: {
        email: "contact@globalent.com",
        phone: "(555) 456-7890",
        website: "www.globalenterprises.com"
      },
      managers: [managerUser._id]
    });

    console.log('Created companies');

    // Create projects
    const websiteProject = await Project.create({
      name: "Website Redesign",
      companyId: acmeCompany._id,
      description: "Complete overhaul of company website with modern design and improved functionality",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-04-30"),
      status: "in-progress",
      budget: 50000,
      managers: [managerUser._id],
      team: [regularUser._id],
      manpowerAllocated: 320
    });

    const mobileProject = await Project.create({
      name: "Mobile App Development",
      companyId: acmeCompany._id,
      description: "Creating a cross-platform mobile application for customer engagement",
      startDate: new Date("2025-02-01"),
      endDate: null,
      status: "in-progress",
      budget: 75000,
      managers: [managerUser._id],
      team: [regularUser._id],
      manpowerAllocated: 480
    });

    const cloudProject = await Project.create({
      name: "Cloud Migration",
      companyId: technovaCompany._id,
      description: "Migrating on-premise infrastructure to cloud services",
      startDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-15"),
      status: "completed",
      budget: 100000,
      managers: [managerUser._id],
      manpowerAllocated: 250
    });

    const ecommerceProject = await Project.create({
      name: "E-commerce Platform",
      companyId: globalCompany._id,
      description: "Building an e-commerce platform with inventory management",
      startDate: new Date("2025-03-01"),
      endDate: null,
      status: "in-progress",
      budget: 120000,
      managers: [managerUser._id],
      team: [regularUser._id],
      manpowerAllocated: 600
    });

    const marketingProject = await Project.create({
      name: "Digital Marketing Campaign",
      companyId: globalCompany._id,
      description: "Comprehensive digital marketing strategy and implementation",
      startDate: new Date("2025-02-15"),
      endDate: new Date("2025-08-15"),
      status: "on-hold",
      budget: 85000,
      managers: [managerUser._id],
      manpowerAllocated: 180
    });

    console.log('Created projects');

    // Update companies with project references
    await Company.updateOne(
      { _id: acmeCompany._id },
      { $set: { projects: [websiteProject._id, mobileProject._id] } }
    );

    await Company.updateOne(
      { _id: technovaCompany._id },
      { $set: { projects: [cloudProject._id] } }
    );

    await Company.updateOne(
      { _id: globalCompany._id },
      { $set: { projects: [ecommerceProject._id, marketingProject._id] } }
    );

    // Create transactions
    await Transaction.create({
      type: "payment",
      amount: 15000,
      description: "Initial payment",
      project: websiteProject._id,
      date: new Date("2025-02-01"),
      status: "paid",
      approvalStatus: "approved",
      createdBy: managerUser._id,
      approvedBy: adminUser._id
    });

    await Transaction.create({
      type: "payment",
      amount: 10000,
      description: "Milestone payment",
      project: websiteProject._id,
      date: new Date("2025-03-15"),
      status: "paid",
      approvalStatus: "approved",
      createdBy: managerUser._id,
      approvedBy: adminUser._id
    });

    await Transaction.create({
      type: "payment",
      amount: 25000,
      description: "Final payment",
      project: websiteProject._id,
      date: new Date("2025-05-01"),
      status: "pending",
      approvalStatus: "pending",
      createdBy: managerUser._id
    });

    await Transaction.create({
      type: "payment",
      amount: 20000,
      description: "Initial payment",
      project: mobileProject._id,
      date: new Date("2025-02-15"),
      status: "paid",
      approvalStatus: "approved",
      createdBy: managerUser._id,
      approvedBy: adminUser._id
    });

    await Transaction.create({
      type: "expense",
      amount: 5000,
      description: "Design team hours",
      category: "manpower",
      project: websiteProject._id,
      date: new Date("2025-01-20"),
      approvalStatus: "approved",
      createdBy: regularUser._id,
      approvedBy: managerUser._id
    });

    await Transaction.create({
      type: "expense",
      amount: 3000,
      description: "UX testing services",
      category: "services",
      project: websiteProject._id,
      date: new Date("2025-02-10"),
      approvalStatus: "approved",
      createdBy: regularUser._id,
      approvedBy: managerUser._id
    });

    console.log('Created transactions');

    // Create resources
    await Resource.create({
      name: "Alex Johnson",
      projectId: websiteProject._id,
      role: "Senior Developer",
      hoursAllocated: 120,
      hourlyRate: 75,
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-04-30")
    });

    await Resource.create({
      name: "Sarah Chen",
      projectId: websiteProject._id,
      role: "UI/UX Designer",
      hoursAllocated: 80,
      hourlyRate: 65,
      startDate: new Date("2025-01-20"),
      endDate: new Date("2025-03-15")
    });

    await Resource.create({
      name: "Michael Rodriguez",
      projectId: mobileProject._id,
      role: "Mobile Developer",
      hoursAllocated: 160,
      hourlyRate: 70,
      startDate: new Date("2025-02-01"),
      endDate: null
    });

    console.log('Created resources');

    // Create expense categories
    const categories = [
      "salary", "equipment", "software", "consulting", "office",
      "travel", "marketing", "utilities", "taxes", "manpower",
      "services", "materials", "other"
    ];

    for (const category of categories) {
      await ExpenseCategory.create({ name: category });
    }

    console.log('Created expense categories');
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
