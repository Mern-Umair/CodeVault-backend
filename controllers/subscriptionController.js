const SubscriptionPlan = require('../models/subscriptionPlanModel');
const UserSubscription = require('../models/userSubscriptionModel');

// Get All Plans (Public)
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      total: plans.length,
      plans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Plan (Admin only)
exports.createPlan = async (req, res) => {
  try {
    const { name, price, duration, features, isRecommended } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      price,
      duration,
      features,
      isRecommended,
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Plan (Admin only)
exports.updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Plan (Admin only)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe to Plan
exports.subscribe = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findOne({
      user: req.user.id,
      status: 'active',
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }

    // Calculate end date based on duration
    const startDate = new Date();
    let endDate = new Date();

    if (plan.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.duration === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100); // 100 years
    }

    const subscription = await UserSubscription.create({
      user: req.user.id,
      plan: planId,
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription activated successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Subscription
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user.id,
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user.id,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Renew Subscription
exports.renewSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user.id,
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const plan = subscription.plan;

    // Calculate new end date
    const startDate = new Date();
    let endDate = new Date();

    if (plan.duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    subscription.status = 'active';
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.autoRenew = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};