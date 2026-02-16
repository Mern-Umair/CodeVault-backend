const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected:', db.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;