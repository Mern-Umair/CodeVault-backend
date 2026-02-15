const { verifyToken } = require('../utils/jwt');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Role-based authorization
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' not authorized` });
  }
  next();
};
