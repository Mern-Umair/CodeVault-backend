const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    duration: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      default: 'monthly',
    },
    features: {
      type: [String],
      required: true,
    },
    isRecommended: {
      type: Boolean,
      default: false,
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

// Auto-increment planId
subscriptionPlanSchema.pre('save', async function () {
  if (this.isNew) {
    this.planId = await getNextSequence('SubscriptionPlan');
  }
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);