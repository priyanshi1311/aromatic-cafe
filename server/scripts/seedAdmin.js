/**
 * Admin Seed Script
 * Usage: node scripts/seedAdmin.js
 * Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env before running
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Table = require('../models/Table');
const Settings = require('../models/Settings');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed admin
    const email = process.env.ADMIN_EMAIL || 'admin@restaurant.com';
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Restaurant Admin';

    if (!password) {
      console.error('ADMIN_PASSWORD not set in .env');
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin already exists: ${email}`);
    } else {
      await Admin.create({ name, email, password });
      console.log(`Admin created: ${email}`);
    }

    // Seed default settings
    await Settings.getSingleton();
    console.log('Settings initialized');

    // Seed sample tables if none exist
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const sampleTables = [
        { tableNumber: 1, capacity: 2, location: 'Window', qrToken: uuidv4() },
        { tableNumber: 2, capacity: 2, location: 'Window', qrToken: uuidv4() },
        { tableNumber: 3, capacity: 4, location: 'Main Hall', qrToken: uuidv4() },
        { tableNumber: 4, capacity: 4, location: 'Main Hall', qrToken: uuidv4() },
        { tableNumber: 5, capacity: 4, location: 'Main Hall', qrToken: uuidv4() },
        { tableNumber: 6, capacity: 6, location: 'Private', qrToken: uuidv4() },
        { tableNumber: 7, capacity: 8, location: 'Outdoor', qrToken: uuidv4() },
        { tableNumber: 8, capacity: 10, location: 'Event Hall', qrToken: uuidv4() },
      ];
      await Table.insertMany(sampleTables);
      console.log(`${sampleTables.length} sample tables created`);
    } else {
      console.log(`${tableCount} tables already exist, skipping`);
    }

    console.log('\nSeed completed successfully!');
    console.log(`Login: ${email} / ${process.env.ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
