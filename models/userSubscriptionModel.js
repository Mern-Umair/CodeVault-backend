const mongoose = require('mongoose');
const getNextSequence = require('../utils/autoIncrement');

const userSubscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active subscription per user
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment subscriptionId
userSubscriptionSchema.pre('save', async function () {
  if (this.isNew) {
    this.subscriptionId = await getNextSequence('UserSubscription');
  }
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);