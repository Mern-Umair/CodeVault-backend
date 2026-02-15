const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const getNextSequence = require('../utils/autoIncrement');

const userSchema = new mongoose.Schema(
  {
    userId: { // sequential number for frontend
      type: Number,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user','manager','super-admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    profilePicture: { type: String, default: '' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Pre-save middleware
userSchema.pre('save', async function () {
  if (this.isNew) {
    this.userId = await getNextSequence('User'); // sequential ID
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
