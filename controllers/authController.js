const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user.userId, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.userId, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROFILE
// GET PROFILE
exports.getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password'); // remove password only
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.status(200).json({
        success: true,
        user: {
          id: user.userId, 
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          profilePicture: user.profilePicture || null,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ success: true, message: 'Profile updated', user: { id: user.userId, name: user.name, email: user.email, role: user.role,    isActive: user.isActive,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture || null,} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15*60*1000;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    res.status(200).json({ success: true, message: 'Password reset link sent', resetToken, resetUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => res.status(200).json({ success: true, message: 'Logout successful' });
