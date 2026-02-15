const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const contestSchema = new mongoose.Schema(
  {
    contestId: {
      type: Number,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'active',
    },
    participants: {
      type: Number,
      default: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment contestId
contestSchema.pre('save', async function () {
  if (this.isNew) {
    this.contestId = await getNextSequence('Contest');
  }
});

module.exports = mongoose.model('Contest', contestSchema);