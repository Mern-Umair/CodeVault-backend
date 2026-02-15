const express = require('express');
const {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  subscribe,
  getMySubscription,
  cancelSubscription,
  renewSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Plan routes (public)
router.get('/plans', getAllPlans);

// Plan CRUD (admin only - abhi testing ke liye protect)
router.post('/plans', protect, createPlan);
router.put('/plans/:id', protect, updatePlan);
router.delete('/plans/:id', protect, deletePlan);

// User subscription routes
router.post('/subscribe', protect, subscribe);
router.get('/my-subscription', protect, getMySubscription);
router.post('/cancel', protect, cancelSubscription);
router.post('/renew', protect, renewSubscription);

module.exports = router;