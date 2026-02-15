const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
require('dotenv').config();
const authRoutes=require("./routes/authRoutes")
const assetRoutes=require("./routes/assetRoutes")
const categoryRoutes=require("./routes/categoryRoutes")
const communityRoutes=require("./routes/communityRoutes")
const contestRoutes=require("./routes/contestRoutes")
const reviewRoutes=require("./routes/reviewRoutes")
const userSubscription=require("./routes/subscriptionRoutes")
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'CodeVault Backend API 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscriptions', userSubscription);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});