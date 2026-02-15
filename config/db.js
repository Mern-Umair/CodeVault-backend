const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // Mongoose settings for serverless
  mongoose.set('strictQuery', false);
  
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return Promise.resolve();
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected:', db.connection.host);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;