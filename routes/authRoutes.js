const express = require('express');
const { register, login, getProfile, updateProfile, forgotPassword, resetPassword, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
