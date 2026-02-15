const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const communityRoutes = require("./routes/communityRoutes");
const contestRoutes = require("./routes/contestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userSubscription = require("./routes/subscriptionRoutes");

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'https://code-vault-frontend-delta.vercel.app',
    'https://code-vault-frontend-bdma.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: err.message || 'Server error'
  });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}