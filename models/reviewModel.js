const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const reviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: Number,
      unique: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
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

// Auto-increment reviewId
reviewSchema.pre('save', async function () {
  if (this.isNew) {
    this.reviewId = await getNextSequence('Review');
  }
});

// Prevent duplicate reviews (one review per user per asset)
reviewSchema.index({ asset: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);