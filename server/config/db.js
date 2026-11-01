const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
  if (!uri) {
    console.error('MongoDB Connection Error: Neither MONGO_URI, MONGODB_URI, MONGO_URL, nor DATABASE_URL was found in environment variables.');
    console.error('Available keys:', Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')).join(', '));
    console.error('Please add MONGO_URI in your Render dashboard under the Environment tab and click Save Changes.');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
