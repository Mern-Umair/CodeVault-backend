const jwt = require('jsonwebtoken');

// JWT using MongoDB _id (string) for auth
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
